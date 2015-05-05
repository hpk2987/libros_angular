var https = require("https");
var config = require("./config");

function searchVolumes(query, callback) {
    var url = config.google.url +
    "/volumes?q=" + query + "&key=" + config.google.APIKey;
    return https.get(url, function(res) {
        var body = '';        
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            body += chunk;
        })
        .on('end', function() {
            callback(processSearch(JSON.parse(body)));
        });        
    }).on('error', function(err) {
        callback(null, err);
    });
}

function processSearch(result){
    var ret = {
        total: result.totalItems ? result.totalItems : 0,
        books: []
    };

    if(result.items){
        result.items.forEach(function(item){
            ret.books.push({
                title: item.volumeInfo.title,
                authors: item.volumeInfo.authors,
                publisher: item.volumeInfo.publisher,
                href: '/api/books/'+item.id
            });
        });
    }

    return ret;
}

module.exports = {
    searchVolumes: searchVolumes
}
