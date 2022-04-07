var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('OUTFITS', function(){
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

  it('should get to the outfit page', function(done){
    const uid = 1;
    const myimgid=20;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          txtimg:'23asd1f',
          imgid:myimgid,
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
          uid:uid,
          uname:uname,
        }],
    });
    chai.request(server)
        .get(`/:${uid}/outfits`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>Outfits</title>`); 
          res.text.should.contain(`${uname}`);
          res.text.should.contain('23asd1f'); 
          res.text.should.contain(`${myimgid}`); 
          done();
        });
  });

  it("should get to the outfit's detail page", function(done){
    const uid = 1;
    const myimgid=20;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          txtimg:'23asd1f',
          imgid:myimgid,
          uname:uname,
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
          uid:uid,
          }],
    });
    chai.request(server)
        .get(`/:${uid}/outfits/:${myimgid}`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>Outfit Details</title>`); 
          res.text.should.contain(`${uname}`);
          res.text.should.contain('23asd1f'); 
          res.text.should.contain(`${myimgid}`); 
          done();
        });
  });

  it("should update the outfit's detail page", function(done){
    const uid = 1;
    const myimgid=20;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({});
    postgreeStubQuery.onCall(1).resolves({
        rows: [{
          txtimg:'23asd1f',
          imgid:myimgid,
          uname:uname,
        }],
    });
    postgreeStubQuery.onCall(2).resolves({
      rows: [{
          uid:uid,
          
        }],
    });
    chai.request(server)
        .post(`/:${uid}/outfits/:${myimgid}`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>Outfit Details</title>`); 
          res.text.should.contain(`${uname}`);
          res.text.should.contain('23asd1f'); 
          res.text.should.contain(`${myimgid}`); 
          done();
        });
  });
  
  it("should delete the outfit's detail page", function(done){
    const uid = 1;
    const myimgid=20;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({}); //delete the obj
    postgreeStubQuery.onCall(1).resolves({}); //delete the obj's comments
    postgreeStubQuery.onCall(2).resolves({}); //delete the obj's trading 
    postgreeStubQuery.onCall(3).resolves({}); //delete the obj's trading 
    postgreeStubQuery.onCall(4).resolves({}); //delete the obj's like
    postgreeStubQuery.onCall(5).resolves({
        rows: [{
      
        }],
    });
    postgreeStubQuery.onCall(6).resolves({
      rows: [{
        uid:uid,
        uname:uname,
        }],
    });
    chai.request(server)
        .post(`/:${uid}/outfits/:${myimgid}/delete`)
        .type('form')
        .send({
        })
        .end(function(error, res){
            res.text.should.contain(`<title>Outfits</title>`); 
          res.text.should.contain(`${uname}`);
          done();
        });
  });
});

