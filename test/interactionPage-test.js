var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index'); // impport that server into this system when we do test
var should = chai.should(); // bunch of assertion that we are making
const sinon = require('sinon');
const pgPool = require('pg-pool');
const { status } = require('express/lib/response');

chai.use(chaiHttp); 

describe('interaction', function(){
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

    it('should click like to a image', function(done){
        const uid = 1;
        const imgid = 10;
        const uname = "tester";
        const likenum = 400;
        postgreeStubQuery.onCall(0).resolves({
            rows:[{
            }]
        });
        postgreeStubQuery.onCall(1).resolves({
            rows:[{
                exists: false
            }],
        });
        postgreeStubQuery.onCall(2).resolves({
            rows:[{}],
        });
        postgreeStubQuery.onCall(3).resolves({
            rows:[{
            }],
        });
        postgreeStubQuery.onCall(4).resolves({
            rows:[{
                uname:`${uname}`,
                uid:`${uid}`,
                imgid: `${imgid}`,
                likenum: `${likenum}`,
            }],
        });
        postgreeStubQuery.onCall(5).resolves({
            rows:[{
                uid:`${uid}`,
                uname:`${uname}`,
            }],
        });
        postgreeStubQuery.onCall(6).resolves({
            rows:[{
            }],
        });

        chai.request(server)
            .post(`/:${uid}/:${imgid}/clickLike`)
            .type('form')
            .end(function(error, res){
             res.should.have.status(200)
            //console.log(res.text);
            res.text.should.contain(`<title>${uname} market</title>`)
            res.text.should.contain(`${likenum}`);
            res.text.should.contain(`${uname}`);
            res.text.should.contain(`${imgid}`);
            res.text.should.contain(`${uid}`);
            done();
        });
    });

    it('should leave a comment', function(done){
        const uid = 1;
        const imgid = 10;
        const uname = "tester";
        const imagecomment = "test comment";
        postgreeStubQuery.onCall(0).resolves({
            rows:[{}]
        });
        postgreeStubQuery.onCall(1).resolves({
            rows:[{}],
        });
        postgreeStubQuery.onCall(2).resolves({
            rows:[{
                imgid:`${imgid}`,
                uid:`${uid}`,
            }],
        });
        postgreeStubQuery.onCall(3).resolves({
            rows:[{
                uid:`${uid}`,
                uname:uname,
            }],
        });
        postgreeStubQuery.onCall(4).resolves({
            rows:[{
                imgid:`${imgid}`,
                uid:`${uid}`,
                imagecomment: `'${imagecomment}'`,
            }],
        });
        chai.request(server)
            .post(`/:${uid}/:${imgid}/comment`)
            .type('form')
            .end(function(error, res){
                res.should.have.status(200);
                //  console.log(res.text);
                res.text.should.contain(`<title>${uname} market</title>`);
                res.text.should.contain(`&#39;${imagecomment}&#39;`)
                res.text.should.contain(`${imgid}`);
                res.text.should.contain(`${uid}`);
                done();
            });
    });
    it('should delete comment', function(done){
        const uname = "tester";
        const uid = 1;
        const imgid = 10;
        const commentid = 15;
        postgreeStubQuery.onCall(0).resolves({
            rows:[{}]
        });
        postgreeStubQuery.onCall(1).resolves({
            rows:[{
                imgid:`${imgid}`,
                uid:`${uid}`,
            }],
        });
        postgreeStubQuery.onCall(2).resolves({
            rows:[{
                uname:uname,
            }],
        });
        postgreeStubQuery.onCall(3).resolves({
            rows:[{
                imgid:`${imgid}`,
                uid:`${uid}`,
            }],
        });
        chai.request(server)
        .post(`/:${uid}/:${imgid}/:${commentid}/deleteComment`)
        .type('form')
        .end(function(error, res){
            res.should.have.status(200);
            res.text.should.contain(`<title>${uname} market</title>`);
            res.text.should.contain(`${imgid}`);
            res.text.should.contain(`${uid}`);
            done();
        });
    });
});