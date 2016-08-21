if (typeof isMobile == 'undefined') {
	var isMobile = $(window).width() < 768;
}
(function($) {
    'use strict';

    var $movedElement,
        initialPopupSettings = {
            hideOnOverlayClick: true,
            hideOnContentClick: false,
            iframe: false,
            title: '',
            customClass: '',
    	};

    $.fn.popup = function(settings) {
        var settings = $.extend({}, initialPopupSettings, settings);
        settings.title = $(this).attr('title');
        $(this).on('click', function(e) {
            e.preventDefault();
            $.popup($(this).attr('href'), settings);
            if ($(this).data('popup-group')) {
                var $itemsInGroup = $('[data-popup-group="'+$(this).data('popup-group')+'"]');
                if ($itemsInGroup.length > 1) {
                    var currentIndex = $itemsInGroup.index($(this)),
                        nextIndex = $itemsInGroup.eq(currentIndex + 1).length ? currentIndex + 1 : 0,
                        prevIndex = currentIndex ? currentIndex - 1 : $itemsInGroup.length - 1;
                    $('.popup-wrapper').append('<div class="popup-nav"><a href="#" class="nav-prev">&lt;</a><a href="#" class="nav-next">&gt;</a></div>');
                    $('.nav-next, .nav-prev').on('click', function(){
                        currentIndex = $(this).hasClass('nav-next') ? nextIndex : prevIndex;
                        nextIndex = $itemsInGroup.eq(currentIndex + 1).length ? currentIndex + 1 : 0;
                        prevIndex = currentIndex ? currentIndex - 1 : $itemsInGroup.length - 1;
                        var newContentHTML = getPopupContent($itemsInGroup.eq(currentIndex).attr('href'), settings.iframe);
                        $('.popup-content').html(newContentHTML);
                    });
                }
            }
        })
    }

    $.popup = function(href, settings) {
        var settings = $.extend({}, initialPopupSettings, settings),
            popupHTML = '<div class="dynamic-popup-wrapper"><div class="dynamic-popup-overlay"></div><div class="dynamic-popup"><a href="#" class="popup-close">x</a><div class="popup-content"></div></div></div>',
            $popupContent = getPopupContent(href, settings.iframe);
        $.popup.close();
        $('body').append(popupHTML);
        $('.popup-content').html('').append($popupContent);
        $('.popup-close').on('click', function(e) {
            e.preventDefault();
            $.popup.close();
        });
        if (settings.title && $.type(settings.title) === 'string') {
            $('.popup-wrapper').append('<div class="popup-title">'+settings.title+'</div>')
        }
        if (settings.customClass) {
            $('.dynamic-popup-wrapper').addClass(settings.customClass);
        }
        if (settings.hideOnOverlayClick) {
            $('.dynamic-popup-overlay').addClass('hide-ooc').on('click', function() {
                $('.popup-close').trigger('click');
            });
        }
        if (settings.hideOnContentClick) {
            $('.dynamic-popup').addClass('hide-occ').on('click', function() {
                $('.popup-close').trigger('click');
            });
        }
    };

    $.popup.close = function(){
        if ($movedElement) {
            $('.tmp-popup-placeholder').after($movedElement);
            $movedElement = null;
        }
        $('.dynamic-popup-wrapper, .tmp-popup-placeholder').remove();
    }

    function getPopupContent(href, iframe){
        var content = '';
        if ($.type(href) === 'string') {
            content = href;
            if (iframe) {
                content= $('<iframe src="'+href+'"></iframe>');
            } else if (href.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
                content = $('<img class="dynamic-popup-img" src="'+href+'">');
            } else {
                try {
                    $movedElement = $(href);
                    if ($movedElement.length) {
                        content = $movedElement;
                        content.before('<div class="tmp-popup-placeholder"></div>');
                    }
                } catch(error) {
                    // do nothing
                }
            }
        }
        return content;
    }

}(jQuery));

/*
* based on tools.js: fancyMsgBox()
*/
function popupMsgBox(msg, title)
{
    if (title) {
        msg = '<h2>'+title+'</h2><p>'+msg+'</p>';
    }
    msg += '<br/><p class="submit" style="text-align:right; padding-bottom: 0"><input class="button" type="button" value="OK" onclick="$.popup.close();" /></p>';
	if(!!$.prototype.popup) {
    	$.popup(msg, {});
    }
}

/*
* based on tools.js: fancyChooseBox()
*/
function popupChooseBox(question, title, buttons, otherParams)
{
    var msg, funcName, action;
	msg = '';
    if (title) {
        msg = '<h2>'+title+'</h2><p>'+question+'</p>';
    }

    msg += '<br/><p class="submit">';
    var i = 0;
    for (var caption in buttons) {
        if (!buttons.hasOwnProperty(caption)) {
            continue;
        }
        funcName = buttons[caption];
        if (typeof otherParams == 'undefined') {
            otherParams = 0;
        }
        otherParams = escape(JSON.stringify(otherParams));
        action = funcName ? "$.popup.close();window['" + funcName + "'](JSON.parse(unescape('" + otherParams + "')), " + i + ")" : "$.popup.close()";
	    msg += '<button type="submit" class="button btn-default button-medium" style="margin-right: 5px;" value="true" onclick="'+action+'">';
	    msg += '<span>'+caption+'</span></button>';
        i++;
    }
    msg += '</p>';
	if(!!$.prototype.popup) {
    	$.popup(msg, {});
    }
}
