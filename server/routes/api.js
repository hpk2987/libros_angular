var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('../config');
var tokenManager = require('../tokenmanager');

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
			res.status(500).json({ message: err.message });
		} else {
			if (docs.length != 0) {
				tokenManager.createUserToken(res.locals.db, docs[0], function(err, id) {
					if (err != null) {
						res.status(500).json({ message: err.message });
					} else {
						res.status(201).json({
							href: '/accesstokens/' + id
						});
					}
				});
			} else {
				res.status(401).json({ message: 'Unauthorized' });
			}
		}
	});
});

router.get('/accesstokens/:id', function(req, res, next) {
	res.locals.db.find({
		_id: req.params.id
	}, function(err, docs) {
		if (err != null) {
			res.status(500).json({ message: err.message });
		} else {
			if (docs.length > 0) {
				res.json({
					username: docs[0].username,
					token:docs[0].token,
					user:'/users/'+docs[0]._id,
				});
			}else{
				res.sendStatus(404);
			}
		}
	});
});

/*********************/
/*     BOOKS 		 */
/*********************/

router.get('/books', function(req, res, next) {
	res.locals.googleAPI.searchVolumes(
	req.query.q,
	function(data, err) {
		if (err != null) {
			res.status(500).json({ message: err.message });
		} else {
			res.json(data);
		}
	},
	res.locals.cache,
	req.query.startIndex,
	req.query.maxResults)
});

router.get('/books/:id', function(req, res, next) {
	res.locals.googleAPI.searchVolume(
	req.params.id,
	function(data, err) {
		if (err != null) {
			res.status(500).json({ message: err.message });
		} else {
			res.json(data);
		}
	},
	res.locals.cache)
});

/*********************/
/*     FAVOURITES	 */
/*********************/

function findUserWithId(res,id,callback){
	var user = {
		_id: id
	};

	res.locals.db.find(user, function(err, docs) {
		if (err != null) {
			res.sendStatus(500).json({ message: err.message });
		} else {
			if(docs.length!=0){
				callback(docs[0]);
			}else{
				res.sendStatus(404).json({ message: 'No user found' });
			}
		}
	})
}

// Get user shelves
router.get('/users/:id/shelves/', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		res.json(user.shelves);
	});
});

// Add shelf
router.put('/users/:id/shelves/:shelf', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		if(user.shelves[req.params.shelf]!=null){
			res.status(409).json({
				message: 'Shelf already exists'
			});
		}else{
			user.shelves[req.params.shelf] = [];
			res.locals.db.update({
					_id:user._id
				},user,{},
				function(err,numReplaced,newDoc){
					if(err!=null){
						res.status(500).json({ message: err.message });
					}
					res.status(201).json({
						href: '/users/'+user._id+'/shelves/'+req.params.shelf
					});
				});
		}
	});
});

// Delete shelf
router.delete('/users/:id/shelves/:shelf', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		if(user.shelves[req.params.shelf]==null){
			res.status(404).json({ message: 'No such shelf' });
		}else{
			var update = {
				$unset: {				
				}
			}
			update.$unset['shelves.'+req.params.shelf] = true;
			res.locals.db.update({
					_id:user._id
				},update,{},
				function(err,numReplaced,newDoc){
					if(err!=null){
						res.status(500).json({ message: err.message });
					}
					res.sendStatus(204);
				});
		}
	});
});

// Get books from shelf
router.get('/users/:id/shelves/:shelf', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		if(user.shelves[req.params.shelf]){
			res.json(user.shelves[req.params.shelf]);
		}else{
			res.status(404).json({ message: "No such shelf" });
		}
		
	});
});

// Add book to shelf
router.put('/users/:id/shelves/:shelf/:book', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		var shelf = user.shelves[req.params.shelf];
		if(shelf==null){
			res.status(404).json({ message: 'No such shelf' });
		}else{			
			if(shelf.indexOf(req.params.book)!=-1){
				res.status(409).json({ message: 'Book already exists in shelf' });
			}else{
				shelf.push(req.params.book);
				res.locals.db.update({
						_id:user._id
					},user,{},
					function(err,numReplaced,newDoc){
						if(err!=null){
							res.status(500).json({ message: err.message });
						}
						res.status(201).json({
							href: '/users/'+user._id+'/shelves/'+req.params.shelf+'/'+req.params.book
						});
					});
			}
		}
	});
});

// Delete book from shelf
router.delete('/users/:id/shelves/:shelf/:book', function(req, res, next) {
	findUserWithId(res,req.params.id,function(user){
		var shelf = user.shelves[req.params.shelf];
		if(shelf==null){
			res.status(404).json({ message: 'No such shelf' });
		}else{
			var bookIdx = shelf.indexOf(req.params.book);
			
			if(bookIdx==-1){
				res.status(404).json({ message: 'No such book' });
			}else{
				shelf.splice(bookIdx,1);
				res.locals.db.update({
						_id:user._id
					},user,{},
					function(err,numReplaced,newDoc){
						if(err!=null){
							res.status(500).json({ message: err.message });
						}
						res.sendStatus(204);
					});
			}
		}
	});
});

module.exports = router;