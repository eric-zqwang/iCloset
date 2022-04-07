var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('Trading Feature and Message Center', function(){
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

  it('should get to the trading page', function(done){
    const uid = 1;
    const myimgid=20;
    const choosenimgid=10;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          txtimg:choosenimgid,
          imgid:choosenimgid,
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
          txtimg:myimgid,
          imgid:myimgid,
        }],
    });
    postgreeStubQuery.onCall(2).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .get(`/:${uid}/:${choosenimgid}/trade`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}, Posting Orders</title>`);
          res.text.should.contain(`<h2>Hello, ${uname}, please select the cloth you want to exchange.</h2>`);       
          done();
        });
  });
  it('The trading page should contain all my imgs and the target img, and posting button', function(done){
    const uid = 1;
    const myimgid=20;
    const choosenimgid=10;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          txtimg:choosenimgid,
          imgid:choosenimgid,
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
          txtimg:myimgid,
          imgid:myimgid,
        }],
    });
    postgreeStubQuery.onCall(2).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .get(`/:${uid}/:${choosenimgid}/trade`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<img src="data:image/gif;base64,${myimgid}"`);
          res.text.should.contain(`<img src="data:image/gif;base64,${choosenimgid}"`); 
          res.text.should.contain(`<form action="/:${uid}/trade/:${choosenimgid}" method="post" >`); 
          done();
        });
  });

  it('Request should post to the message page.', function(done){
    const uid = 1;
    const uid2 = 2;
    const myimgid=20;
    const choosenimgid=10;
    const reqid=6;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({  rows: [{ }],  });
    postgreeStubQuery.onCall(1).resolves({});
    postgreeStubQuery.onCall(2).resolves({
        rows: [{
            reqid:`${reqid}`,
            imgid:`${myimgid}`,
            txtimg:`${myimgid}`,
            uid:`${uid}`,

          }],
      });
      postgreeStubQuery.onCall(3).resolves({
        rows: [{
            reqid:`${reqid}`,
            imgid:`${choosenimgid}`,
            txtimg:`${choosenimgid}`,
            uid:`${uid2}`,
            status:'Processing',
          }],
      });
      postgreeStubQuery.onCall(4).resolves({
        rows: [{
          }],
      });
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
        .post(`/:${uid}/trade/:${choosenimgid}`)
        .type('form')
        .send({
        })
        .end(function(error, res){
            res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Messages</title>`);
         res.text.should.contain(`${reqid}`);    
         res.text.should.contain(`${myimgid}`);
         res.text.should.contain(`${choosenimgid}`);  
         res.text.should.contain('Processing'); 
          done();
        });
  });

  it('should cancel/remove trading request', function(done){
    const uid = 1;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({});
    postgreeStubQuery.onCall(1).resolves({
        rows: [{            
          }],
      });
      postgreeStubQuery.onCall(2).resolves({
        rows: [{            
          }],
      });
      postgreeStubQuery.onCall(3).resolves({
        rows: [{           
          }],
      });
      postgreeStubQuery.onCall(4).resolves({
        rows: [{
          }],
      });
      postgreeStubQuery.onCall(5).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .post(`/:${uid}/cancel_trading_request/`)
        .type('form')
        .send({
            'uid':'1',
            'reqid':'1',
        })
        .end(function(error, res){
            res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Messages</title>`);
          
          done();
        });
  });
  it('should accept trading request', function(done){
    const uid = 1;
    const uid2 = 2;
    const myimgid=20;
    const choosenimgid=10;
    const reqid=1;
    const uname = "testUser";
    
    postgreeStubQuery.onCall(0).resolves({rows: [{}],}); //check req status
    postgreeStubQuery.onCall(1).resolves({});   //update img1 -> img2
    postgreeStubQuery.onCall(2).resolves({});   //update img2 -> img1 
    postgreeStubQuery.onCall(3).resolves({});   //reject img1 <- others
    postgreeStubQuery.onCall(4).resolves({});   //reject img2 <- others
    postgreeStubQuery.onCall(5).resolves({});   //delete img1 -> others
    postgreeStubQuery.onCall(6).resolves({});   //delete img2 -> others
    postgreeStubQuery.onCall(7).resolves({});   //update req -> completed
    postgreeStubQuery.onCall(8).resolves({rows: [{
       
    }],});                                      //select Request Recived img1
    postgreeStubQuery.onCall(9).resolves({      //select Request Recived img2
        rows: [{     
            
                   
          }],
      });
      postgreeStubQuery.onCall(10).resolves({   //select user request img3
        rows: [{           
            reqid:`${reqid}`,
            imgid:`${myimgid}`,
            txtimg:`${myimgid}`,
            uid:`${uid}`,
            
          }],
      });
      postgreeStubQuery.onCall(11).resolves({   //select user request img4
        rows: [{
            reqid:`${reqid}`,
            imgid:`${choosenimgid}`,
            txtimg:`${choosenimgid}`,
            uid:`${uid2}`,
            status:'Complected',
          }],
      });
      postgreeStubQuery.onCall(12).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .post(`/:${uid}/accept_trading_request/`)
        .type('form')
        .send({
            'uid':'1',
            'reqid':'1',
        })
        .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain(`<title>${uname}'s Messages</title>`);
            res.text.should.contain(`${reqid}`);    
            res.text.should.contain(`${myimgid}`);
            res.text.should.contain(`${choosenimgid}`);
            res.text.should.contain('Complected');
            done();
        });
  });


  it('should reject trading request', function(done){
    const uid = 1;
    const uid2 = 2;
    const myimgid=20;
    const choosenimgid=10;
    const reqid=1;
    const uname = "testUser";
    postgreeStubQuery.onCall(0).resolves({rows: [{            
    }],}); //check req status
    postgreeStubQuery.onCall(1).resolves({}); //update req status -> 'Rejected'
    postgreeStubQuery.onCall(2).resolves({
        rows: [{            
          }],
      });
      postgreeStubQuery.onCall(3).resolves({
        rows: [{            
          }],
      });
      postgreeStubQuery.onCall(4).resolves({
        rows: [{           
            
            reqid:`${reqid}`,
            imgid:`${choosenimgid}`,
            txtimg:`${choosenimgid}`,
            uid:`${uid2}`,
            
          }],
      });
      postgreeStubQuery.onCall(5).resolves({
        rows: [{
            reqid:`${reqid}`,
            imgid:`${myimgid}`,
            txtimg:`${myimgid}`,
            uid:`${uid}`,
            status:'Rejected',
          }],
      });
      postgreeStubQuery.onCall(6).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .post(`/:${uid}/reject_trading_request/`)
        .type('form')
        .send({
            'uid':'1',
            'reqid':'1',
        })
        .end(function(error, res){
            res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Messages</title>`);
          res.text.should.contain(`${reqid}`);    
          res.text.should.contain(`${myimgid}`);
          res.text.should.contain(`${choosenimgid}`);
          res.text.should.contain('Rejected');
          
          done();
        });
  });

  it('should get to message page', function(done){
    const uid = 1;
    const uname = "testUser";
    
    postgreeStubQuery.onCall(0).resolves({
        rows: [{}],
      });
      postgreeStubQuery.onCall(1).resolves({
        rows: [{ }],
      });
      postgreeStubQuery.onCall(2).resolves({
        rows: [{}],
      });
      postgreeStubQuery.onCall(3).resolves({
        rows: [{}],
      });
      postgreeStubQuery.onCall(4).resolves({
        rows: [{
            uid:uid,
            uname:uname,
          }],
      });
    chai.request(server)
        .get(`/:${uid}/Messages`)
        .type('form')
        .send({
        })
        .end(function(error, res){
            res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Messages</title>`);
          done();
        });
  });

});

