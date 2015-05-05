var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config');
var tokenManager = require('../tokenmanager');

function sendServerError(err, res) {
	res.status = 500;
	res.json({
		message: err.message
	});
}

/*********************/
/*  AUTHENTICATION   */
/*********************/

router.post('/accesstokens', function(req, res, next) {
	var user = {
		username: req.body.username,
		password: req.body.password
	};

	res.locals.db.find(user, function(err, docs) {
		if (err != null) {
			sendServerError(err, res);
		} else {
			if (docs.length != 0) {
				tokenManager.createUserToken(res.locals.db, docs[0], function(err, id) {
					if (err != null) {
						sendServerError(err, res);
					} else {
						res.status(201);
						res.json({
							href: '/accesstokens/' + id
						});
					}
				});
			} else {
				res.status(401);
				res.json({
					message: 'Unauthorized'
				});
			}
		}
	});
});

router.get('/accesstokens/:id', function(req, res, next) {
	res.locals.db.find({
		_id: req.params.id
	}, function(err, docs) {
		if (err != null) {
			sendServerError(err, res);
		} else {
			if (docs.length > 0) {
				res.json({
					token: docs[0].token
				});
			}else{
				res.sendStatus(404);
			}
		}
	});
});

/*********************/
/*     SERVICES		 */
/*********************/

router.get('/books', function(req, res, next) {
	res.locals.googleAPI.searchVolumes(req.query.q, function(data, err) {
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