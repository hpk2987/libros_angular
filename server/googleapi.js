var https = require("https");
var config = require("./config");

function searchVolumes(query,callback,cache,startIndex,maxResults) {
    var url = config.google.url +
    '/volumes?q=' + query +
    (startIndex != null ? '&startIndex=' + startIndex : '') + 
    (maxResults != null ? '&maxResults=' + maxResults : '') + 
    '&projection=lite';
    
    console.log( 'GAPI call => ' + url);
    cache.wrap(url,function(cacheCallback){
        return https.get(url, function(res) {
            var len = res.headers['content-length'] ? 
                            parseInt(res.headers['content-length'], 10):
                            0;

            console.log( 'GAPI response received => ' + 
                Math.ceil(len/1024) + " KB");

            var body = '';        
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                cacheCallback(null,processBooksSearch(JSON.parse(body)));
            });        
        }).on('error', function(err) {
            cacheCallback(err,null);
        });
    },function(err,data){
        callback(data,err);
    });
}

function processBooksSearch(result){
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
                imageLinks: item.volumeInfo.imageLinks,
                id: item.id,
                href: '/books/'+item.id                
            });
        });
    }

    return ret;
}

function searchVolume(id,callback,cache) {
    var url = config.google.url +
    '/volumes/' + id ;
    
    console.log( 'GAPI call => ' + url);
    cache.wrap(url,function(cacheCallback){
        return https.get(url, function(res) {
            var len = res.headers['content-length'] ? 
                            parseInt(res.headers['content-length'], 10):
                            0;

            console.log( 'GAPI response received => ' + 
                Math.ceil(len/1024) + " KB");

            var body = '';        
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                cacheCallback(null,processBookSearch(JSON.parse(body)));
            });        
        }).on('error', function(err) {
            cacheCallback(err,null);
        });
    },function(err,data){
        callback(data,err);
    });
}

function processBookSearch(result){
    return {
        title: result.volumeInfo.title,
        authors: result.volumeInfo.authors,
        publisher: result.volumeInfo.publisher,
        publishedDate: result.volumeInfo.publishedDate,
        description: result.volumeInfo.description,
        industryIdentifiers: result.volumeInfo.industryIdentifiers,
        pageCount: result.volumeInfo.pageCount,
        dimensions: result.volumeInfo.dimensions,
        averageRating: result.volumeInfo.averageRating,
        imageLinks: result.volumeInfo.imageLinks,
        language: result.volumeInfo.language
    };
}

module.exports = {
    searchVolumes: searchVolumes,
    searchVolume: searchVolume
}
