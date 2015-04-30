var fs = require('fs');
var request = require('supertest');
var app = require('../app.js');
var config = require('../config.js');
var Datastore = require('nedb');
var tokenManager = require('../tokenmanager');
var assert = require('assert');
var Regex = require("regex");

function prepareTestUser(callback) {
    var user = {
        username: 'test',
        password: 'test'
    };
    app.db.insert(user, function(err, newDoc) {
        if (err != null) {
            assert("Error al crear usuario", false);
        } else {
            tokenManager.createUserToken(
                app.db, newDoc,
                function(err, id) {
                    if (err != null) {
                        assert("Error al crear usuario", false);
                    } else {
                        app.db.find({ _id:id },function(err,docs){
                            if(err!=null || docs.length==0){
                                assert("Error al crear usuario",false);
                            }
                            callback(docs[0]);
                        })                        
                    }
                });
        }
    });
}

describe("In book server", function() {
    beforeEach('Preparing DB', function() {
        app.db = new Datastore();
    });

    describe("routing", function() {
        it("should exists route authenticate", function(done) {
            request(app)
                .post('/api/accesstokens', {
                    username: 'a',
                    password: 'a'
                })
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("should exists route books", function(done) {
            request(app)
                .get('/api/books')
                .expect('Content-Type', /json/)
                .expect(401, done);

        });
    });

    describe("authentication", function() {
        it("should allow authentication with correct credentials", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                        .post('/api/accesstokens')
                        .send({
                            username: 'test',
                            password: 'test'
                        })
                        .set('Content-Type:', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(201)
                        .end(function(err, res) {
                            var rePattern = new RegExp(/\/api\/accesstokens\/.*$/);
                            var arrMatches = res.body.location.match(rePattern);
                            assert(arrMatches[0] === res.body.location, "Location invalido => " + res.body.location);
                            done();
                        });
                });
        });
    });

    describe("api", function() {
        it("should return json response when search books with query", function(done) {
            var original = app.googleAPI;
            app.googleAPI = {
                searchVolumes: function(query, callback) {
                    console.log("AAAAAAAAAAAAA!");
                    callback({
                        dummy: 'ok'
                    });
                }
            }
            console.log(app.googleAPI.searchVolumes.toString());

            prepareTestUser(
                function(user) {
                    request(app)
                        .get('/api/books?q=flowers+inauthor:keyes')
                        .set('Content-Type:', 'application/json')
                        .set('Authorization', 'Bearer ' + user.token)
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err, res) {
                            assert.equal(res.body, {
                                dummy: 'ok'
                            });
                            done();
                        });
                });

            app.googleAPI = original;
        });
    });
});