var https = require("https");
var config = require("./config");


function searchVolumes(query, callback) {
	var url = config.google.url +
		"/volumes?q=" + query + "&key=" + config.google.APIKey;

	return https.get(config.google.url, function(res) {
		callback(res.data);
	}).on('error', function(err) {
		callback(null, err);
	});
}

module.exports = {
	searchVolumes: searchVolumes
}