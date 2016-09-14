// animate.css
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

// socket
var socket = io.connect('http://localhost:3000');
socket.on('h4ndsh4k3', function (data) {
  console.log(data);
});

// recieve the rendered template results
socket.on('search:results', function(data) {
    console.log(data);
    $('.results').empty().text(data.results.content);
});

// offline
socket.on('connect_error', function(err) {
    console.log('Cannot connect to server. Possibly offline. Reconnecting...');
});

// search
var searchTimeout = null;
$('input[type="text"]').on('input', function(e) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    if ($(this).val().length >= 3) {
        var val = $(this).val();
        searchTimeout = setTimeout(function() {
            socket.emit('search', {keyword: val});
        }, 1000);
    }
});
