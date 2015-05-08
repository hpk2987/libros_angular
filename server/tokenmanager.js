var config = require('./config')
var jwt = require('jsonwebtoken');

function createUserToken(db, user, callback) {
	var token = jwt.sign({
		username: user.username,
		time: new Date().getTime()
	}, config.appSecret);

	var newUser = {
		$set:{
			token: token
		}
	};

	db.update({
		_id: user._id
	}, newUser, {}, function(err, numReplaced) {
		callback(err, user._id);
	});
}

module.exports = {
	createUserToken: createUserToken
}