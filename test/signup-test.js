var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('sign up', function(){
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

    it('should show sign up page to user', function(done){
        chai.request(server)
            .get('/signUp.html')
        .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain("<title>sign up page</title>");
            done();
        })
    });

    it('should fail to sign up because umail already exists', function(done){
        const uid = 1;
        const uname = "tester";
        const umail = 'test@test.com';
         postgreeStubQuery.onCall(0).resolves({
            rows: [{
              uid: uid,
              uname:uname,
              umail:umail
            }],
        });
        postgreeStubQuery.onCall(1).resolves({
          rows: [{
                uid: uid,
                uname:uname,
                umail:umail
            }],
        });

        chai.request(server)
            .post(`/signUp`)
        .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain("The register email already exist");
            done();
        })
    });
    
    it('should success sign up for user', function(done){
        const uid = 1;
        const uname = "tester";
        const umail = 'test@test.com';
        postgreeStubQuery.onCall(0).resolves({});
        postgreeStubQuery.onCall(1).resolves({
            rows:[{
                uid: uid,
                uname: uname,
                umail:umail
            }]
        });

        chai.request(server)
            .post(`/signUp`)
        .then(function(error, res){
            res.should.have.status(200);
            res.text.should.contain("Please confirm your email");
        })
        .end(done());
    });

    it('should verify user email', function(done){
        postgreeStubQuery.onCall(0).resolves({});
        chai.request(server)
            .get('/verify-email')
        .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain('<title>User Login Form</title>');
            done();
        })
    });
});