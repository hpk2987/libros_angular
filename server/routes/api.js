var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Datastore = require('nedb'),
	db = new Datastore({
		filename: './users.db',
		autoload: true
	});

function ensureAuthorized(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== 'undefined') {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];

		try {
			var decoded = jwt.verify(req.body.token, secret);
			next();
		} catch (err) {
			// err
			console.log(err);
			res.send(403);
		}
	} else {
		res.send(403);
	}
}

router.post('/authenticate', function(req, res, next) {
	var username = req.body.username,
		password = req.body.password;

	db.find({
		username: username,
		password: password
	}, function(err, docs) {
		if (err != null) {
			res.status(500);
			res.json({
				message: err.message
			})
		} else {
			if (docs.length != 0) {
				res.json({
					token: docs[0].token
				});
			} else {
				res.status(403);
				res.json({
					message: 'Invalid user or pass'
				});
			}
		}
	});

});

router.post('/books', ensureAuthorized, function(req, res, next) {
	res.json({});
});

module.exports = router;