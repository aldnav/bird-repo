var request = require('request');
var cheerio = require('cheerio');

var endpoint = 'https://search.macaulaylibrary.org/catalog.json';
var wikiEndpoint = 'https://en.wikipedia.org/w/api.php?action=parse&prop=text&format=json&redirects=';

/**
 * Searches the Macaulay library through their http endpoint
 * @param  {String} keyword   Search keyword
 * @param  {String} mediaType Audio|Photo
 * @return {Object}           The JSON response object
 */
function libSearch(keyword, mediaType, callback) {
    if (typeof mediaType === 'function') {
        callback = mediaType;
        mediaType = null;
    }
    var kw = keyword ? keyword : 'king penguin';
    // Let's be gentle with our request. Limit it to some count and
    // sort by popularity (rating).
    var query = {'q': kw, 'count': 120, 'sort': 'rating_desc'};
    if (mediaType && typeof mediaType !== 'undefined' &&
        (mediaType === 'Audio' || mediaType === 'Video')) {
        query.mediaType = mediaType;
    }
    request({
        url: endpoint,
        qs: query,
        method: 'GET'
    }, function(error, response, body) {
        if (error) {
            console.error(error);
            return;
        }
        var obj = JSON.parse(body);
        obj.library = 'mcl';
        if (typeof callback === 'function') {
            callback(obj);
        }
    });
}

/**
 * Searches wikipedia API
 * @param  {String} keyword Search keyword
 * @param  {String} format  (text/html) Format of the obj to be returned.
 * @return {Object}         Object with respect to format
 */
function wikiSearch(keyword, format, callback) {
    if (typeof format === 'function') {
        callback = format;
        format = null;
    }
    format = format ? format: 'text';
    request({
        url: wikiEndpoint,
        qs: {page: keyword}
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }
        var obj = JSON.parse(body);
        var hasError = false;
        var $;
        try {
            // see if we have a document
            $ = cheerio.load(obj.parse.text['*']);
        } catch (e) {
            hasError = true;
        }
        var result = {library: 'wikipedia'};
        if (!hasError) {
            // Get content before toc. Most likely will give us
            // the summary.
            if (format === 'html') {
                result.result = $.html($('#toc').prevAll());
            } else {
                result.result = $('#toc').prevAll().text();
            }
        }
        if (typeof callback === 'function') {
            callback(result);
        }
    });
}


// libSearch('King Penguin');
// wikiSearch('King Penguin');

module.exports = {
    libSearch: libSearch,
    wikiSearch: wikiSearch
};
