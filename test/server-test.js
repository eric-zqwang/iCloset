var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making

chai.use(chaiHttp); 

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