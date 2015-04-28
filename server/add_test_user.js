var Datastore = require('nedb'),
	db = new Datastore({
		filename: './users.db',
		autoload: true
	});

var secret = "Secret!";
var jwt = require('jsonwebtoken');
var token = jwt.sign({
	username: "hernan",
	time: new Date().getTime()
}, secret);

db.insert({
	username: 'hernan',
	password: 'hernan',
	token: token
});