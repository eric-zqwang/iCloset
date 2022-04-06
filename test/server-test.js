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

   afterEach( function () {
      pgPool.prototype.query.restore();
   });

   it('should get a redirect to the userlogin.html', function(done){
      chai.request(server).get("/")
         .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain('<title>User Login Form</title>');
            done();
         });
   });
   it('user should sign in to the app', function(done){
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
            'email' : uname,
            'pswd' : password
         })
         .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain('<title>Home page</title>');
            done();
      });
   });
   it('user should see error when sign in with wrong password', function(done){
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
            'email' : uname,
            'pswd' : "wrongPassword"
         })
         .end(function(error, res){
            res.text.should.contain('Incorrect email or password');
            done();
      });
   });
});

describe('Trades', function(){
   //Get trading page
   it('should get a redirect to the trading.ejs', function(done){
      chai.request(server).get("/:3/:3/trade")
         .end(function(error, res){
          // res.should.have.status(200);
         //  res.text.should.contain('<title>Posting Orders</title>');
         // console.log(res.text)
            done();
      });
   });
});