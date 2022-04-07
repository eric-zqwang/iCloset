var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');

chai.use(chaiHttp); 

describe('Calendar', function(){
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

  it('should show the correct calendar page for a user', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          uid: uid,
          uname:uname
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        }],
    });

    chai.request(server)
        .get(`/:${uid}/calendar`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Calendar</title>`);           
          done();
        });
  });

  it('should show the image of the date if there are existing', function(done){
    const uid = 1;
    const uname = "testUser";
    const password = "testPwd";
    postgreeStubQuery.onCall(0).resolves({
        rows: [{
          uid: uid,
          uname:uname
        }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        imgsetid:'1',
        uid:uid,
        year:'2022',
        month:'4',
        day:'6',
        txtimg: "w4e5ywas4y",
      }],
    });

    chai.request(server)
        .get(`/:${uid}/calendar`)
        .type('form')
        .send({
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Calendar</title>`);
          res.text.should.contain('d == 6 && current_year == 2022 && current_month == 4');
          res.text.should.contain('w4e5ywas4y');       
          done();
    });
  });

  it('should go to the page where users can choose the outfits for the chosen date', function(done){
    const uname = "testUser";
    const uid = 1;
    postgreeStubQuery.onCall(0).resolves({
      rows:[{
        imgid:"10",
        uid:uid,
        uname:uname,
        txtimg:"w4e5ywas4y"
      }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        uid:uid,
        uname:uname
      }],
    });
   const day=11; 
   const month=4;
   const year=2022;

    chai.request(server)
        .post(`/:${uid}/calendaraddimg`)
        .type('form')
        .send({
          'days':`${day}`,
          'months':`${month}`,
          'years':`${year}`,
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname} Add/Change Calendar</title>`);
          res.text.should.contain(`${year} - ${month} - ${day}`);
          res.text.should.contain(`Hello, ${uname}`);
          // console.log(res.text)
          res.text.should.contain(`<form action="/:${uid}/calendaradd/:${year}/:${month}/:${day}" method="post" >`);         
          done();
    });
  });
  it('The adding image to calendar page should contain images that user has', function(done){
    const uname = "testUser";
    const uid = 1;
    postgreeStubQuery.onCall(0).resolves({
      rows:[{
        imgid:"10",
        uid:uid,
        uname:uname,
        txtimg:"w4e5ywas4y"
      }],
    });
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        uid:uid,
        uname:uname
      }],
    });
   const day=11; 
   const month=4;
   const year=2022;

    chai.request(server)
        .post(`/:${uid}/calendaraddimg`)
        .type('form')
        .send({
           'days':`${day}`,
           'months':`${month}`,
           'years':`${year}`,
        })
        .end(function(error, res){         
          res.text.should.contain('w4e5ywas4y'); 
          done();
    });
  });
  it('should update the calendar with the chosen image (POST)', function(done){
    const uname = "testUser";
    const uid = 1;
    const day=11; 
    const month=4;
    const year=2022;
    postgreeStubQuery.onCall(0).resolves({});
    postgreeStubQuery.onCall(1).resolves({});
    postgreeStubQuery.onCall(2).resolves({
      rows: [{
        uid: uid,
        uname:uname,
      }],
  });
  postgreeStubQuery.onCall(3).resolves({
    rows: [{
      imgid:"10",
      imgsetid:"10",
      uid:uid,
      year:year,
      month:month,
      day:day,
        txtimg:"w4e5ywas4y"
      }],
  });
 
  chai.request(server)
        .post(`/:${uid}/calendaradd/:${year}/:${month}/:${day}`)
        .type('form')
        .send({
          // 'days':`${day}`,
          // 'months':`${month}`,
          // 'years':`${year}`,
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Calendar</title>`);
          res.text.should.contain(`d == ${day} && current_year == ${year} && current_month == ${month}`);
          res.text.should.contain('w4e5ywas4y');  
          done();
      });
  
  });

  it('should remove the outfit from the calendar', function(done){
    const uname = "testUser";
    const uid = 1;
    const day=11; 
    const month=4;
    const year=2022;
    postgreeStubQuery.onCall(0).resolves({});
    postgreeStubQuery.onCall(1).resolves({
      rows: [{
        uid: uid,
        uname:uname,
      }],
  });
  postgreeStubQuery.onCall(2).resolves({
    rows: [{

      }],
  });
 
  chai.request(server)
        .post(`/:${uid}/calendaradd/:${year}/:${month}/:${day}/remove`)
        .type('form')
        .send({
          // 'days':`${day}`,
          // 'months':`${month}`,
          // 'years':`${year}`,
        })
        .end(function(error, res){
          res.should.have.status(200);
          res.text.should.contain(`<title>${uname}'s Calendar</title>`);
          done();
      });
  
  });

});