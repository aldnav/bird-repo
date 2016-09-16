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
var mclResults;
var loaded = 0;
var loadSize = 12;
var maxCount = 120;
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
            if (data.result.trim().length > 0 ) {
                $('.results').removeClass('hide').show().animateCss('fadeInUp');
                $('.results').empty().append(data.result);
            } else {
                $('.results').animateCss('fadeOutDown');
                setTimeout(function() {
                    $('.results').empty().addClass('hide');
                }, 100);
            }
        } else if (data.library === 'mcl') {
            // mcl resources
            $('.mcl-row').empty();
            if (data.results.count > 0) {
                mclResults = data.results;
                loaded = 0;
                fetchRenderMCL();
            }
        }
    }
});

/**
 * Fetches from the mclResults and renders template
 */
function fetchRenderMCL() {
    if (mclResults && mclResults.count > 0 && loaded < mclResults.count &&
        loaded < maxCount) {
        var hasMaxed = false;
        for (var i = loaded, j = 0; j < loadSize; i++) {
            var dataObj = mclResults.content[i];
            if (dataObj === undefined) {
                hasMaxed = true;
                break;
            }
            dataObj.isAudio = dataObj.mediaType === 'Audio';
            dataObj.isPhoto = dataObj.mediaType === 'Photo';
            var template = null;
            var rendered = null;
            template = $('#mcl-card').html();
            rendered = Mustache.render(template, dataObj);
            if (template !== null) {
                $('.mcl-row').append(rendered);
            }
            loaded++;
            j++;
        }
        if (loaded < mclResults.count && loaded < maxCount && !hasMaxed) {
            $('#load-more-btn').removeClass('hide disabled').show();
        } else {
            $('#load-more-btn').hide();
        }
    } else {
        $('#load-more-btn').hide();
    }
}

$(document).on('click', '#load-more-btn', function(e) {
    $('#load-more-btn').addClass('disabled');
    fetchRenderMCL();
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
