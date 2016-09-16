var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var glob = require('glob');
var library = require('./library.js');


app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/templates', 'index.html'));
});

var port = 3000;
server.listen(port, function() {
    console.log('Listening on port ' + port + '...');
});

// find available images for background
// var bg;
// glob(__dirname + '/public/images/**/*.*',
//     {cache: 'FILE'}, function(er, files) {
//     bg = files[Math.floor(Math.random() * files.length)];
//     bg = bg.split('/').pop();
// });

io.on('connection', function (socket) {
    socket.emit('h4ndsh4k3', {message: 'ACK RCVD'});
    socket.on('search', function (data) {
        var keyword = data.keyword;
        library.wikiSearch(keyword, 'html', function(results) {
            socket.emit('search:results', results);
            library.libSearch(keyword, function(results) {
                socket.emit('search:results', results);
            });
        });
    });
});

// library.libSearch('King Penguin', function(results) {
//     console.log(results.results.content);
// });
//
// library.wikiSearch('King Penguin', function(results) {
//     console.log(results);
// });
