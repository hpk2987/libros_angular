var google = require('../googleapi')
var request = require('supertest');
var fs = require('fs');
var config = require('../config');
var nock = require('nock');
var assert = require('assert');

nock.enableNetConnect();

var fakeCache = {
    wrap: function(key,work,callback){
        work(callback);
    },
    keys: function(){
        return [];
    }
}

describe('In google API', function() {

    it("should searchVolumnes return google books api json properly transformed", function(done) {
        nock.disableNetConnect();
    
        var exampleJSON = fs.readFileSync('./test/books.example.json', 'utf8');
        var expected = fs.readFileSync('./test/expected.processed.example.json', 'utf8');

        var scope = nock('https://www.googleapis.com:443')
				.get('/books/v1/volumes?q=example&projection=lite&key=' + config.google.APIKey)
            	.reply(200, exampleJSON, {'Content-Type': 'application/json'});

        google.searchVolumes('example',function(data,err){
        	console.log(JSON.stringify(data));
            assert.equal(JSON.stringify(data), expected);
        	done();
        },fakeCache);

        nock.enableNetConnect();
    });

    it("should searchVolumnes return empty on empty query", function(done) {
        nock.disableNetConnect();
    
        var scope = nock('https://www.googleapis.com:443')
                .get('/books/v1/volumes?q=&projection=lite&key=' + config.google.APIKey)
                .reply(200, '{}', {'Content-Type': 'application/json'});

        google.searchVolumes('',function(data,err){
            assert.equal(JSON.stringify(data), '{"total":0,"books":[]}');
            done();
        },fakeCache);

        nock.enableNetConnect();
    });

    it("should searchVolumnes include startIndex and maxResults in query", function(done) {
        nock.disableNetConnect();
    
        var scope = nock('https://www.googleapis.com:443')
                .get('/books/v1/volumes?q=&startIndex=0&maxResults=10&projection=lite&key=' + config.google.APIKey)
                .reply(200, '{}', {'Content-Type': 'application/json'});

        google.searchVolumes('',function(data,err){
            assert.equal(JSON.stringify(data), '{"total":0,"books":[]}');
            done();
        },fakeCache,0,10);

        nock.enableNetConnect();
    });

    it("should searchVolumne return google books api json properly transformed", function(done) {
        nock.disableNetConnect();
    
        var exampleJSON = fs.readFileSync('./test/book.example.json', 'utf8');
        var expected = fs.readFileSync('./test/expected.processed.book.example.json', 'utf8');

        var scope = nock('https://www.googleapis.com:443')
                .get('/books/v1/volumes/GgkSAAAACAAJ?key=' + config.google.APIKey)
                .reply(200, exampleJSON, {'Content-Type': 'application/json'});

        google.searchVolume('GgkSAAAACAAJ',function(data,err){
            assert.equal(JSON.stringify(data), expected);
            done();
        },fakeCache);

        nock.enableNetConnect();
    });
})
