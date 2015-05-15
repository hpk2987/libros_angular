var fs = require('fs');
var request = require('supertest');
var app = require('../app.js');
var config = require('../config.js');
var Datastore = require('nedb');
var tokenManager = require('../tokenmanager');
var assert = require('assert');
var Regex = require("regex");

function prepareTestUser(callback,shelves) {
    var user = {
        username: 'test',
        password: 'test',        
    };
    if(shelves){
        user.shelves = shelves;
    }
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
                        app.db.find({ _id:id }, function(err, docs) {
                            if (err != null || docs.length == 0) {
                                assert("Error al crear usuario", false);
                            }
                            callback(docs[0]);
                        })                        
                    }
                });
        }
    });
}

app.db = new Datastore();

describe("In book server", function() { 

    afterEach("Clean Database", function() {
        app.db.remove({});
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
                        var rePattern = new RegExp(/\/accesstokens\/.*$/);
                        var arrMatches = res.body.href.match(rePattern);                        
                        assert(arrMatches!=null,"No match");
                        assert(arrMatches.length>0,"No match");
                        assert(arrMatches[0] === res.body.href, "Location invalido => " + res.body.href);
                        done();
                    });
                });
        });
    });

    describe("api", function() {
        
        it("should /books?q= return json response when search books with query", function(done) {
            var f = app.googleAPI.searchVolumes;
            app.googleAPI.searchVolumes = function(q,c,si,mr){
                c({dummy:'ok'});
            }

            prepareTestUser(
                function(user) {
                    request(app)
                    .get('/api/books?q=example')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, {dummy:'ok'});
                        done();

                        app.googleAPI.searchVolumes = f;
                    });
                });            
        });

        it("should /books/:id return json response when search book with query", function(done) {
            var f = app.googleAPI.searchVolume;
            app.googleAPI.searchVolume = function(q,c){
                c({dummy:'ok'});
            }

            prepareTestUser(
                function(user) {
                    request(app)
                    .get('/api/books/xxx')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, {dummy:'ok'});
                        done();

                        app.googleAPI.searchVolume = f;
                    });
                });            
        });


        it("should /users/:id/shelves get user shelves", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .get('/api/users/'+user._id+'/shelves')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, {
                            cat1:[],
                            cat2:[]
                        });
                        done();
                    });
                },{
                    cat1:[],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf add user shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .put('/api/users/'+user._id+'/shelves/cat3')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(201)
                    .end(function(err, res) {   
                        app.db.find({_id:user._id},function(err,docs){
                            assert.deepEqual(docs[0].shelves, {
                                cat1:[],
                                cat2:[],
                                cat3:[]
                            });
                            done();
                        });
                    });
                },{
                    cat1:[],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf not add duplicate user shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .put('/api/users/'+user._id+'/shelves/cat2')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, {
                            message : 'Shelf already exists'
                        });
                        done();
                    });
                },{
                    cat1:[],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf delete user shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .delete('/api/users/'+user._id+'/shelves/cat1')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect(204)
                    .end(function(err, res) {
                        app.db.find({_id:user._id},function(err,docs){
                            assert.deepEqual(docs[0].shelves, {
                                cat2:[]
                            });
                            done();
                        })
                    });
                },{
                    cat1:[],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf get user shelf content", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .get('/api/users/'+user._id+'/shelves/cat1')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, ['a','b']);
                        done();
                    });
                },{
                    cat1:['a','b'],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf/:book add book to shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .put('/api/users/'+user._id+'/shelves/cat1/c')
                    .send({id:'c'})
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .end(function(err, res) {
                        assert.deepEqual(res.body, { href : '/users/'+user._id+'/shelves/cat1/c' });
                        done();
                    });
                },{
                    cat1:[{id:'a'},{id:'b'}],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf/:book not add duplicates", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .put('/api/users/'+user._id+'/shelves/cat1/a',{id:'a'})
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body, { message : 'Book already exists in shelf' });
                        done();
                    });
                },{
                    cat1:[{id:'a'},{id:'b'}],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf/:book delete book from shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .delete('/api/users/'+user._id+'/shelves/cat1/a')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(204)
                    .end(function(err, res) {   
                        app.db.find({_id:user._id},function(err,docs){
                            assert.deepEqual(docs[0].shelves.cat1, [{id:'b'}]);
                            done();
                        })
                    });
                },{
                    cat1:[{id:'a'},{id:'b'}],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf/:book fail to delete non-existant", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .delete('/api/users/'+user._id+'/shelves/cat1/w')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body,{ message: 'No such book' });
                        done();
                    });
                },{
                    cat1:['a','b'],
                    cat2:[]
                });
        });

        it("should /users/:id/shelves/:shelf/:book fail to delete from non-existant shelf", function(done) {
            prepareTestUser(
                function(user) {
                    request(app)
                    .delete('/api/users/'+user._id+'/shelves/cat4/w')
                    .set('Content-Type:', 'application/json')
                    .set('Authorization', 'Bearer ' + user.token)
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end(function(err, res) {   
                        assert.deepEqual(res.body,{ message: 'No such shelf' });
                        done();
                    });
                },{
                    cat1:['a','b'],
                    cat2:[]
                });
        });
    });
});
