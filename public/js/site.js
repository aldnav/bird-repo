// animate.css
$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).on(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
});

// socket
var socket = io.connect('http://localhost:3000');
socket.on('h4ndsh4k3', function (data) {
  console.log(data);
});

// handle wiki links
$(document).on('click', '.results a', function(e) {
    e.preventDefault();
    window.open('https://en.wikipedia.org' + $(this).attr('href'), '_blank');
});

// receive the results
socket.on('search:results', function(data) {
    $('.preloader-col').animateCss('zoomOut fadeOut');
    setTimeout(function() {
        $('.preloader').removeClass('active');
        $('.preloader-col')
            .removeClass('preloader-on')
            .addClass('preloader-off');
    }, 100);
    if (data) {
        if (data.library === 'wikipedia') {
            // wiki results first
            $('.results').removeClass('hide').animateCss('fadeInUp');
            $('.results').empty().append(data.result);
        } else if (data.library === 'mcl') {
            // mcl resources
            console.log('MCL:\t', data);
            var loadSize = 10;
            if (data.results.count > 0) {
                for (var i = 0; i < loadSize; i++) {
                    var dataObj = data.results.content[i];
                    var template = $('<div class="col s4"></div>');
                    if (dataObj.mediaType === 'Photo') {
                        // template.append('<img class="responsive-img" src="'+ dataObj.previewUrl +'"></img>');
                        template.append('<card></card>');
                    }
                    $('.mcl-row').append(template);
                }
            }
        }
    }
});

// offline
socket.on('connect_error', function(err) {
    console.log('Cannot connect to server. Possibly offline. Reconnecting...');
});


// search
var searchTimeout = null;
var hasSearched = false;
$('#search').on('input', function(e) {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    if (!hasSearched) {
        hasSearched = true;
        $('.spacer').addClass('spacer-off');
    }
    if ($(this).val().length >= 3) {
        var val = $(this).val();
        $('.preloader-col')
            .removeClass('preloader-off')
            .addClass('preloader-on');
        $('.preloader-col').animateCss('zoomIn fadeIn');
        $('.preloader').addClass('active');
        searchTimeout = setTimeout(function() {
            socket.emit('search', {keyword: val});
        }, 1000);
    }
});
