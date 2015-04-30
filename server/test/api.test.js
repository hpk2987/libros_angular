var fs = require('fs');
var request = require('supertest');
var app = require('../app.js');
var config = require('../config.js');
var Datastore = require('nedb');
var tokenManager = require('../tokenmanager');
var assert = require('assert');

function prepareTestUser(callback) {
    tokenManager.createUserWithToken(
        app.db, {
            username: 'test',
            password: 'test'
        },
        callback);
}

describe("In book server", function() {
    beforeEach('Preparing DB', function() {
        app.db = new Datastore();
    });

    describe("routing", function() {

        it("should exists route authenticate", function(done) {

            request(app)
                .post('/api/authenticate', {
                    username: 'a',
                    password: 'a'
                })
                .expect('Content-Type', /json/)
                .expect(403, done);

        });

        it("should exists route books", function(done) {

            request(app)
                .post('/api/books')
                .expect('Content-Type', /json/)
                .expect(403, done);

        });
    });

    describe("authentication", function() {

        it("should allow authentication with correct credentials", function(done) {

            prepareTestUser(
                function(err, newDoc) {
                    if (err) {
                        console.log("WARNING: " + err.message);
                    } else {
                        request(app)
                            .post('/api/authenticate')
                            .send({
                                username: 'test',
                                password: 'test'
                            })
                            .set('Content-Type:', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function(err, res) {
                                assert.notEqual(res.body.token, null, "No hay token");
                                done();
                            });
                    }
                });

        });
    });
});