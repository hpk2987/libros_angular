var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var fs = require('fs');
var config = require('../config')

/*********************/
/*  AUTHENTICATION   */
/*********************/

function ensureAuthorized(req, res, next) {
	var bearerToken;
	var bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== 'undefined') {
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];

		try {
			var decoded = jwt.verify(req.body.token, config.appSecret);
			next();
		} catch (err) {
			// err
			console.log(err);
			res.status(403)
				.json({
					message: 'Not authorized'
				});
		}
	} else {
		res.status(403)
			.json({
				message: 'Not authorized'
			});
	}
}

router.post('/authenticate', function(req, res, next) {
	var username = req.body.username,
		password = req.body.password;

	res.locals.db.find({
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

/*********************/
/*     SERVICES		 */
/*********************/

var https = require("https");

var googleAPI = {
	searchVolumes: function(query, callback) {
		var url = googleAPI.url +
			"/volumes?q=" + query + "&key=" + config.google.APIKey;

		return https.get(config.google.url, function(res) {
			callback(res.data);
		}).on('error', function(err) {
			callback(null, err);
		});
	}
}

router.post('/books', ensureAuthorized, function(req, res, next) {
	googleAPI.searchVolumes("flowers+inauthor:keyes", function(data, err) {
		if (err != null) {
			res.status = 500;
			res.json({
				message: err.message
			});
		} else {
			res.json(data);
		}
	})
});

module.exports = router;