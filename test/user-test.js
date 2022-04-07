var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('Users', function(){
  // tests associated with Users
  var postgreeStubQuery;
  beforeEach(function () {
    postgreeStubQuery = sinon.stub(pgPool.prototype, 'query');
  });

  afterEach(function () {
    pgPool.prototype.query.restore();
  });

  after(function () {
    require('../index').stop();
  });

  it('should sign in to the app', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        uid: uid
      }],
    });
    postgreeStubQuery.onCall(2).resolves({
      rows: [{
        uname: uname,
        uid: uid
      }],
    });
    postgreeStubQuery.onCall(3).resolves({
      rows: [{
        uname: uname,
        uid: uid
      }],
    });

    chai.request(server)
        .post("/userlogin")
        .type('form')
        .send({
          'email': uname,
          'pswd': password
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Calendar</title>`);
          done();
    });
  });

  it('should see an error when signing in with a wrong password', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid
        }],
    });
    postgreeStubQuery.onSecondCall().resolves({
        rows: [{
          uid: uid
        }],
    });

    chai.request(server)
        .post("/userlogin")
        .type('form')
        .send({
          'email': uname,
          'pswd': "wrongPassword"
        })
        .end(function(error, res){
          res.text.should.contain('Incorrect email or password');
          done();
    });
  });

  it('should see an error when not confirming an email address', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: false,
          upswd: password,
          uname: uname,
          uid: uid
        }],
    });
    postgreeStubQuery.onSecondCall().resolves({
        rows: [{
          uid: uid
        }],
    });

    chai.request(server)
        .post("/userlogin")
        .type('form')
        .send({
          'email': uname,
          'pswd': password
        })
        .end(function(error, res){
          res.text.should.contain('Please confirm your email!!!');
          done();
    });
  });

  it('should see an error when there are duplicate user', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: false,
          upswd: password,
          uname: uname,
          uid: uid
        },{
          confirm: false,
          upswd: password,
          uname: uname,
          uid: uid
        }],
    });
    postgreeStubQuery.onSecondCall().resolves({
        rows: [{
          uid: uid
        },{
          uid: uid
        }],
    });

    chai.request(server)
        .post("/userlogin")
        .type('form')
        .send({
          'email': uname,
          'pswd': password
        })
        .end(function(error, res){
          res.text.should.contain('DUPLICATE USERS!!!');
          done();
    });
  });

  it('should log out from the app', function(done){
    chai.request(server).get("/:1/userlogout")
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain('<title>User Login Form</title>');
          done();
        });
  });
});