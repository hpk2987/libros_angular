var google = require('../googleapi')
var request = require('supertest');
var fs = require('fs');
var config = require('../config');
var nock = require('nock');
var assert = require('assert');

nock.enableNetConnect();

describe('In google API', function() {
    it("should searchVolumnes return transformed google books api json properly", function(done) {
        nock.disableNetConnect();
    
        var exampleJSON = fs.readFileSync('./test/books.example.json', 'utf8');
        var expected = fs.readFileSync('./test/expected.processed.example.json', 'utf8');

        var scope = nock('https://www.googleapis.com:443')
				.get('/books/v1/volumes?q=example&key=' + config.google.APIKey)
            	.reply(200, exampleJSON, {'Content-Type': 'application/json'});

        google.searchVolumes('example',function(data,err){
        	assert.equal(JSON.stringify(data), expected);
        	done();
        });

        nock.enableNetConnect();
    });

    it("should searchVolumnes return empty on empty query", function(done) {
        nock.disableNetConnect();
    
        var scope = nock('https://www.googleapis.com:443')
                .get('/books/v1/volumes?q=&key=' + config.google.APIKey)
                .reply(200, '{}', {'Content-Type': 'application/json'});

        google.searchVolumes('',function(data,err){
            assert.equal(JSON.stringify(data), '{"total":0,"books":[]}');
            done();
        });

        nock.enableNetConnect();
    });
})
