var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('Collages', function(){
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

  it('should show the collages for a user', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onFirstCall().resolves({
        rows: [{}],
    });
    postgreeStubQuery.onSecondCall().resolves({
      rows: [{
        uid: uid
      }],
    });

    chai.request(server)
        .get(`/:${uid}/collage`)
        .type('form')
        .send({
          'id': ":1"
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain('<title>Outfit Collages</title>');
          done();
    });
  });

  it('should save collage', function(done){
    const uid = 1;
    postgreeStubQuery.onFirstCall().resolves({});
    postgreeStubQuery.onSecondCall().resolves({
      rows: [{}],
    });
    postgreeStubQuery.onThirdCall().resolves({
      rows: [{
        uid: uid
      }],
    });
    chai.request(server)
        .post("/saveCollage")
        .type('form')
        .send({
          'collageimg': "data:image/png;base64,w4e5ywas4y",
          'id': `:${uid}`
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain('<title>Outfit Collages</title>');
          done();
    });
  });
});