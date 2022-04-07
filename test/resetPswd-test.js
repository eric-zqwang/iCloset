var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('reset password', function(){
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

  it('should show reset pswd page', function(done){
    chai.request(server)
        .get('/reset-pswd')
        .type('form')
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>reset password</title>`);           
          done();
        });
  });

    // it('should send reset password email', function (done) { // error message
    //     chai.request(server)
    //         .post('/pswd')
    //         .type('form')
    //         .then(function (error, res) {
    //             res.should.have.status(200);
    //             res.text.should.contain('Please check your email.');
    //             done();
    //         })
    //         .end(done());
    // });

    // it('should correctly reset password', function (done) {
    //     postgreeStubQuery.onCall(0).resolves({
    //         rows: [{
    //         }],
    //     });
    //     chai.request(server)
    //         .post('/resetPswd')
    //         .type('form')
    //         .end(function (error, res) {
    //             res.should.have.status(200);
    //             res.text.should.contain('<title>User Login Form</title>');
    //             done();
    //         })
    // });

});