var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('Admins', function(){
  // tests associated with Admin
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

  it('should get a redirect to the userlogin.html', function(done){
    chai.request(server).get("/")
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain('<title>User Login Form</title>');
          done();
        });
  });

  it('should sign in to the app', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid,
          admin: true
        }],
    });
    postgreeStubQuery.onSecondCall().resolves({
      rows: [{
        confirm: true,
        upswd: password,
        uname: uname,
        uid: uid
      }],
    });

    chai.request(server)
        .post("/adminlogin")
        .type('form')
        .send({
          'email': uname,
          'pswd': password
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain('<h2>User Information</h2>');
          done();
    });
  });

  it('should see error when sign in with wrong password', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid,
          admin: true
        }],
    });

    chai.request(server)
        .post("/adminlogin")
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

  it('should see all user info', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid,
          admin: true
        }],
    });

    chai.request(server)
        .get("/userinfo")
        .type('form')
        .end(function(error, res){
          res.text.should.contain('<h2>User Information</h2>');
          done();
    });
  });

  it('should see each user info', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{
          confirm: true,
          upswd: password,
          uname: uname,
          uid: uid,
          admin: true
        }],
    });

    chai.request(server)
        .get(`/usrs/:${uname}`)
        .type('form')
        .send({
          'umail': uname
        })
        .end(function(error, res){
          res.text.should.contain('<h2>User Detail</h2>');
          done();
    });
  });

  it('should delete user', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({});
    postgreeStubQuery.onSecondCall().resolves({
      rows: [{
        confirm: true,
        upswd: password,
        uname: uname,
        uid: uid,
        admin: true
      }],
    });
    chai.request(server)
        .post(`/usrs/:${uname}`)
        .type('form')
        .send({
          'umail': uname
        })
        .end(function(error, res){
          res.text.should.contain('<h2>User Information</h2>');
          done();
    });
  });

  it('should edit user info', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({});
    postgreeStubQuery.onSecondCall().resolves({
      rows: [{
        confirm: true,
        upswd: password,
        uname: uname,
        uid: uid,
        admin: true
      }],
    });
    chai.request(server)
        .post(`/edituser/:${uname}`)
        .type('form')
        .send({
          'umail': uname,
          'name': uname,
          'password': password,
          'isadmin': true
        })
        .end(function(error, res){
          res.text.should.contain('<h2>User Information</h2>');
          done();
    });
  });
});