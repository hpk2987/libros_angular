var fs = require('fs');
var request = require('supertest');
var app = require('../app.js');
var config = require('../config.js');
var Datastore = require('nedb');
var tokenManager = require('../tokenmanager');

function prepareDb() {
    fs.unlink(config.db.test, function(err) {
        if (err) {
            console.log('WARNING: ' + err);
        } else {
            console.log('successfully deleted ' + config.db.test);
        }
    });

    app.db = new Datastore({
        filename: config.db.test,
        autoload: true
    });
}

function prepareTestUser(callback) {
    tokenManager.createUserWithToken(
        app.db, {
            username: 'test',
            password: 'test'
        },
        callback);
}

function doneErr(done, err) {
    if (err != null) {
        done.fail(err.message);
    } else {
        done();
    }
}

describe("In book server", function() {
    describe("routing", function() {
        it("should exists route authenticate", function(done) {
            prepareDb();

            request(app)
                .post('/api/authenticate', {
                    username: 'a',
                    password: 'a'
                })
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function(err, res) {
                    doneErr(done, err);
                });
        });

        it("should exists route books", function(done) {
            prepareDb();

            request(app)
                .post('/api/books')
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function(err, res) {
                    doneErr(done, err);
                });
        });
    });

    describe("authentication", function() {
        it("should allow authentication with correct credentials", function(done) {
            prepareDb();

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
                                expect(res.body.token).toBeDefined();
                                doneErr(done, err);
                            });
                    }
                });
        });
    });
});