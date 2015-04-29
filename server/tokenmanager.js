var config = require('./config')
var jwt = require('jsonwebtoken');

function createUserWithToken(db, user, callback) {
	var token = jwt.sign({
		username: user.username,
		time: new Date().getTime()
	}, config.appSecret);

	var newUser = {
		username: user.username,
		password: user.password,
		token: token
	};

	db.insert(newUser, function(err, newDoc) {
		callback(err, newDoc);
	});
}

module.exports = {
	createUserWithToken: createUserWithToken
}