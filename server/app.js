var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var Datastore = require('nedb');
var api = require('./routes/api');
var app = express();
var config = require('./config')
var googleAPI = require('./googleapi')
var cacheManager = require('cache-manager');

/* Inject dependencies */
app.googleAPI = googleAPI;

app.cache = cacheManager.caching({store: 'memory'});

app.db = new Datastore({
	filename: config.db.filename,
	autoload: true
});

/* JWT Authentication */
app.use(jwt({
	secret: config.appSecret
}).unless({
	path: [/\/api\/accesstokens.*/]
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

/* Config locals */
app.use(function(req, res, next) {
	res.locals.db = app.db;
	res.locals.googleAPI = app.googleAPI;
	res.locals.cache = app.cache;
	next();
});

/* Config allowed headers */
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

	next();
});

app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.json({
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		message: err.message
	});
});


module.exports = app;