var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var library = require('./library.js');


app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/templates', 'index.html'));
});

var port = process.env.PORT || 8080;
var ip = process.env.IP || '0.0.0.0';
server.listen(port, ip, function() {
    console.log('Listening on port ' + port + '...');
});

io.on('connection', function (socket) {
    socket.emit('h4ndsh4k3', {message: 'ACK RCVD'});
    socket.on('search', function (data) {
        /**
        * When searching, do the wiki search for. Assume there is at least
        * an article or some sort. Then, search from the MCL library.
        * The MCL will give us the media data (images, videos, audios).
        */
        var keyword = data.keyword;
        library.wikiSearch(keyword, 'html', function(results) {
            socket.emit('search:results', results);
            library.libSearch(keyword, function(results) {
                socket.emit('search:results', results);
            });
        });
    });
});
