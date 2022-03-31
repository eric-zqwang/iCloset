var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making

chai.use(chaiHttp); 

describe('Users', function(){
    // tests associated with Users
    it('should get a redirect to the userlogin.html', function(done){
        chai.request(server).post("/signUp").redirects(0)
         .end(function(error, res){
            res.should.redirect;
            done();
         });
    });
});

