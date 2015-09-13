glax = function(text){$c=$('#chatline');$c.val(text+$c.val());$c.focus();};
$('#messagebuffer').on('click','.username',function(){glax($(this).text());})
                   .on('click','.action, .poll-notify',function(){glax($(this).text().split(' ')[0]+": ");})
$('#userlist').on('click','span',function(){glax($(this).text()+": ");}); 

window.cytubeEnhancedSettings = {
    channelName: "Oneeme", //optional
    language: 'ru', //optional
    modulesSettings: {
         utils: {
        enabled: false,
        unfixedTopNavbar: false,
        insertUsernameOnClick: false,
        showScriptInfo: false
    },
    videoControls: {
        enabled: true,
        turnOffVideoOption: false,
        selectQualityOption: true,
    },
    showVideoInfo: {
        enabled: false
    },
    standardUITranslate: {
        enabled: true
    }
    }
};

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

},{}],2:[function(require,module,exports){
/*!
 * jQuery.selection - jQuery Plugin
 *
 * Copyright (c) 2010-2014 IWASAKI Koji (@madapaja).
 * http://blog.madapaja.net/
 * Under The MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($, win, doc) {
    /**
     * get caret status of the selection of the element
     *
     * @param   {Element}   element         target DOM element
     * @return  {Object}    return
     * @return  {String}    return.text     selected text
     * @return  {Number}    return.start    start position of the selection
     * @return  {Number}    return.end      end position of the selection
     */
    var _getCaretInfo = function(element){
        var res = {
            text: '',
            start: 0,
            end: 0
        };

        if (!element.value) {
            /* no value or empty string */
            return res;
        }

        try {
            if (win.getSelection) {
                /* except IE */
                res.start = element.selectionStart;
                res.end = element.selectionEnd;
                res.text = element.value.slice(res.start, res.end);
            } else if (doc.selection) {
                /* for IE */
                element.focus();

                var range = doc.selection.createRange(),
                    range2 = doc.body.createTextRange();

                res.text = range.text;

                try {
                    range2.moveToElementText(element);
                    range2.setEndPoint('StartToStart', range);
                } catch (e) {
                    range2 = element.createTextRange();
                    range2.setEndPoint('StartToStart', range);
                }

                res.start = element.value.length - range2.text.length;
                res.end = res.start + range.text.length;
            }
        } catch (e) {
            /* give up */
        }

        return res;
    };

    /**
     * caret operation for the element
     * @type {Object}
     */
    var _CaretOperation = {
        /**
         * get caret position
         *
         * @param   {Element}   element         target element
         * @return  {Object}    return
         * @return  {Number}    return.start    start position for the selection
         * @return  {Number}    return.end      end position for the selection
         */
        getPos: function(element) {
            var tmp = _getCaretInfo(element);
            return {start: tmp.start, end: tmp.end};
        },

        /**
         * set caret position
         *
         * @param   {Element}   element         target element
         * @param   {Object}    toRange         caret position
         * @param   {Number}    toRange.start   start position for the selection
         * @param   {Number}    toRange.end     end position for the selection
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        setPos: function(element, toRange, caret) {
            caret = this._caretMode(caret);

            if (caret === 'start') {
                toRange.end = toRange.start;
            } else if (caret === 'end') {
                toRange.start = toRange.end;
            }

            element.focus();
            try {
                if (element.createTextRange) {
                    var range = element.createTextRange();

                    if (win.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
                        toRange.start = element.value.substr(0, toRange.start).replace(/\r/g, '').length;
                        toRange.end = element.value.substr(0, toRange.end).replace(/\r/g, '').length;
                    }

                    range.collapse(true);
                    range.moveStart('character', toRange.start);
                    range.moveEnd('character', toRange.end - toRange.start);

                    range.select();
                } else if (element.setSelectionRange) {
                    element.setSelectionRange(toRange.start, toRange.end);
                }
            } catch (e) {
                /* give up */
            }
        },

        /**
         * get selected text
         *
         * @param   {Element}   element         target element
         * @return  {String}    return          selected text
         */
        getText: function(element) {
            return _getCaretInfo(element).text;
        },

        /**
         * get caret mode
         *
         * @param   {String}    caret           caret mode
         * @return  {String}    return          any of the following: "keep" | "start" | "end"
         */
        _caretMode: function(caret) {
            caret = caret || "keep";
            if (caret === false) {
                caret = 'end';
            }

            switch (caret) {
                case 'keep':
                case 'start':
                case 'end':
                    break;

                default:
                    caret = 'keep';
            }

            return caret;
        },

        /**
         * replace selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            replacement text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        replace: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.start + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        /**
         * insert before the selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            insertion text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        insertBefore: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start + text.length, end: tmp.end + text.length};

            element.value = orig.substr(0, tmp.start) + text + orig.substr(tmp.start);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        },

        /**
         * insert after the selected text
         *
         * @param   {Element}   element         target element
         * @param   {String}    text            insertion text
         * @param   {String}    caret           caret mode: any of the following: "keep" | "start" | "end"
         */
        insertAfter: function(element, text, caret) {
            var tmp = _getCaretInfo(element),
                orig = element.value,
                pos = $(element).scrollTop(),
                range = {start: tmp.start, end: tmp.end};

            element.value = orig.substr(0, tmp.end) + text + orig.substr(tmp.end);

            $(element).scrollTop(pos);
            this.setPos(element, range, caret);
        }
    };

    /* add jQuery.selection */
    $.extend({
        /**
         * get selected text on the window
         *
         * @param   {String}    mode            selection mode: any of the following: "text" | "html"
         * @return  {String}    return
         */
        selection: function(mode) {
            var getText = ((mode || 'text').toLowerCase() === 'text');

            try {
                if (win.getSelection) {
                    if (getText) {
                        // get text
                        return win.getSelection().toString();
                    } else {
                        // get html
                        var sel = win.getSelection(), range;

                        if (sel.getRangeAt) {
                            range = sel.getRangeAt(0);
                        } else {
                            range = doc.createRange();
                            range.setStart(sel.anchorNode, sel.anchorOffset);
                            range.setEnd(sel.focusNode, sel.focusOffset);
                        }

                        return $('<div></div>').append(range.cloneContents()).html();
                    }
                } else if (doc.selection) {
                    if (getText) {
                        // get text
                        return doc.selection.createRange().text;
                    } else {
                        // get html
                        return doc.selection.createRange().htmlText;
                    }
                }
            } catch (e) {
                /* give up */
            }

            return '';
        }
    });

    /* add selection */
    $.fn.extend({
        selection: function(mode, opts) {
            opts = opts || {};

            switch (mode) {
                /**
                 * selection('getPos')
                 * get caret position
                 *
                 * @return  {Object}    return
                 * @return  {Number}    return.start    start position for the selection
                 * @return  {Number}    return.end      end position for the selection
                 */
                case 'getPos':
                    return _CaretOperation.getPos(this[0]);

                /**
                 * selection('setPos', opts)
                 * set caret position
                 *
                 * @param   {Number}    opts.start      start position for the selection
                 * @param   {Number}    opts.end        end position for the selection
                 */
                case 'setPos':
                    return this.each(function() {
                        _CaretOperation.setPos(this, opts);
                    });

                /**
                 * selection('replace', opts)
                 * replace the selected text
                 *
                 * @param   {String}    opts.text            replacement text
                 * @param   {String}    opts.caret           caret mode: any of the following: "keep" | "start" | "end"
                 */
                case 'replace':
                    return this.each(function() {
                        _CaretOperation.replace(this, opts.text, opts.caret);
                    });

                /**
                 * selection('insert', opts)
                 * insert before/after the selected text
                 *
                 * @param   {String}    opts.text            insertion text
                 * @param   {String}    opts.caret           caret mode: any of the following: "keep" | "start" | "end"
                 * @param   {String}    opts.mode            insertion mode: any of the following: "before" | "after"
                 */
                case 'insert':
                    return this.each(function() {
                        if (opts.mode === 'before') {
                            _CaretOperation.insertBefore(this, opts.text, opts.caret);
                        } else {
                            _CaretOperation.insertAfter(this, opts.text, opts.caret);
                        }
                    });

                /**
                 * selection('get')
                 * get selected text
                 *
                 * @return  {String}    return
                 */
                case 'get':
                    /* falls through */
                default:
                    return _CaretOperation.getText(this[0]);
            }

            return this;
        }
    });
})(jQuery, window, window.document);

},{}],3:[function(require,module,exports){
window.cytubeEnhanced = new window.CytubeEnhanced(
    $('title').text(),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.language || 'en') : 'en'),
    (window.cytubeEnhancedSettings ? (window.cytubeEnhancedSettings.modulesSettings || {}) : {})
);

},{}],4:[function(require,module,exports){
window.CytubeEnhanced = function(channelName, language, modulesSettings) {
    'use strict';

    this.channelName = channelName;

    var translations = {};

    var modules = {};
    var MODULE_LOAD_TIMEOUT = 10000; //ms
    var MODULE_LOAD_PERIOD = 100; //ms


    /**
     * Gets the module
     *
     * Returns $.Deferred() promise object and throws error exception if timeout
     *
     * @param {string} moduleName The name of the module
     * @returns {object}
     */
    this.getModule = function (moduleName) {
        var promise = $.Deferred();
        var time = MODULE_LOAD_TIMEOUT;

        (function getModuleRecursive() {
            if (modules[moduleName] !== undefined) {
                promise.resolve(modules[moduleName]);
            } else if (time <= 0) {
                throw new Error("Load timeout for module " + moduleName + '.');
            } else {
                time -= MODULE_LOAD_PERIOD;

                setTimeout(getModuleRecursive, MODULE_LOAD_PERIOD);
            }
        })();

        return promise;
    };


    /**
     * Adds the module
     *
     * @param {string} moduleName The name of the module
     * @param ModuleConstructor The module's constructor
     */
    this.addModule = function (moduleName, ModuleConstructor) {
        if (this.isModulePermitted(moduleName)) {
            var moduleSettings = modulesSettings[moduleName] || {};

            modules[moduleName] = new ModuleConstructor(this, moduleSettings);
            modules[moduleName].settings = moduleSettings;
        }
    };


    /**
     * Configures the module
     *
     * Previous options don't reset.
     *
     * @param {string} moduleName  The name of the module
     * @param moduleOptions The module's options
     */
    this.configureModule = function (moduleName, moduleOptions) {
        $.extend(true, modulesSettings[moduleName], moduleOptions);
    };


    /**
     * Checks if module is permitted
     *
     * @param moduleName The name of the module to check
     * @returns {boolean}
     */
    this.isModulePermitted = function (moduleName) {
        return modulesSettings.hasOwnProperty(moduleName) ?
            (modulesSettings[moduleName].hasOwnProperty('enabled') ? modulesSettings[moduleName].enabled : true) :
            true;
    };


    /**
     * Adds the translation object
     * @param language The language identifier
     * @param translationObject The translation object
     */
    this.addTranslation = function (language, translationObject) {
        translations[language] = translationObject;
    };


    /**
     * Translates the text
     * @param text The text to translate
     * @returns {string}
     */
    this.t = function (text) {
        var translatedText = text;

        if (language !== 'en' && translations[language] !== undefined) {
            if (text.indexOf('[.]') !== -1) {
                var textWithNamespaces = text.split('[.]');

                translatedText = translations[language][textWithNamespaces[0]];
                for (var namespace = 1, namespacesLen = textWithNamespaces.length; namespace < namespacesLen; namespace++) {
                    translatedText = translatedText[textWithNamespaces[namespace]];
                }
            } else {
                translatedText = translations[language][text];
            }
        } else if (text.indexOf('[.]') !== -1) { //English text by default
            translatedText = text.split('[.]').pop();
        }

        return translatedText;
    };


    /**
     * UserConfig constructor
     * @constructor
     */
    var UserConfig = function () {
        /**
         * UserConfig options
         * @type {object}
         */
        this.options = {};

        /**
         * Sets the user's option and saves it in the user's cookies
         * @param name The name ot the option
         * @param value The value of the option
         */
        this.set = function (name, value) {
            this.options[name] = value;
            window.setOpt(window.CHANNEL.name + "_config-" + name, value);
        };

        /**
         * Gets the value of the user's option
         *
         * User's values are setted up from user's cookies at the beginning of the script by the method loadDefaults()
         *
         * @param name Option's name
         * @returns {*}
         */
        this.get = function (name) {
            if (!this.options.hasOwnProperty(name)) {
                this.options[name] = window.getOrDefault(window.CHANNEL.name + "_config-" + name, undefined);
            }

            return this.options[name];
        };

        /**
         * Toggles user's boolean option
         * @param name Boolean option's name
         * @returns {boolean}
         */
        this.toggle = function (name) {
            var result = !this.get(name);

            this.set(name, result);

            return result;
        };
    };

    /**
     * User's options
     * @type {UserConfig}
     */
    this.userConfig = new UserConfig();
};

},{}],5:[function(require,module,exports){
window.cytubeEnhanced.addModule('additionalChatCommands', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        permittedCommands: ['*']
    };
    settings = $.extend({}, defaultSettings, settings);

    function isCommandPermitted(commandName) {
        return settings.permittedCommands.indexOf('*') !== -1 || settings.permittedCommands.indexOf(commandName) !== -1 || false;
    }


    this.askAnswers = ["100%", app.t('qCommands[.]of course'), app.t('qCommands[.]yes'), app.t('qCommands[.]maybe'), app.t('qCommands[.]impossible'), app.t('qCommands[.]no way'), app.t('qCommands[.]don\'t think so'), app.t('qCommands[.]no'), "50/50", app.t('qCommands[.]fairy is busy'), app.t('qCommands[.]I regret to inform you')];


    this.randomQuotes = [];


    /**
     *The list of commands
     *
     * Every command must have method value(message) which returns command's message.
     * Commands can also have description property for chatCommandsHelp module and isAvailable method which returns false if command is not permitted (by default returns true)
     *
     * @type {object}
     */
    this.commandsList = {
        '!pick ': {
            description: app.t('chatCommands[.]random option from the list of options (!pick option1, option2, option3)'),
            value: function (msg) {
                var variants = msg.replace('!pick ', '').split(',');
                return variants[Math.floor(Math.random() * (variants.length - 1))].trim();
            }
        },
        '!ask ': {
            description: app.t('chatCommands[.]asking a question with yes/no/... type answer (e.g. <i>!ask Will i be rich?</i>)'),
            value: function () {
                return that.askAnswers[Math.floor(Math.random() * (that.askAnswers.length - 1))];
            }
        },
        '!time': {
            description: app.t('chatCommands[.]show the current time'),
            value: function () {
                var h = new Date().getHours();
                if (h < 10) {
                    h = '0' + h;
                }

                var m = new Date().getMinutes();
                if (m < 10) {
                    m = '0' + m;
                }

                return app.t('chatCommands[.]current time') + ': ' + h + ':' + m;
            }
        },
        '!dice': {
            description: app.t('chatCommands[.]throw a dice'),
            value: function () {
                return Math.floor(Math.random() * 5) + 1;
            }
        },
        '!roll': {
            description: app.t('chatCommands[.]random number between 0 and 999'),
            value: function () {
                var randomNumber = Math.floor(Math.random() * 1000);

                if (randomNumber < 100) {
                    randomNumber = '0' + randomNumber;
                } else if (randomNumber < 10) {
                    randomNumber= '00' + randomNumber;
                }

                return randomNumber;
            }
        },
       
        '!skip': {
            description: app.t('chatCommands[.]vote for the video skip'),
            value: function (msg) {
                window.socket.emit("voteskip");
                msg = app.t('chatCommands[.]you have been voted for the video skip');

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('voteskip');
            }
        },
        '!next': {
            description: app.t('chatCommands[.]play the next video'),
            value: function (msg) {
                window.socket.emit("playNext");
                msg = app.t('chatCommands[.]the next video is playing');

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistjump');
            }
        },
        '!bump': {
            description: app.t('chatCommands[.]bump the last video'),
            value: function (msg) {
                var $lastEntry = $('#queue').find('.queue_entry').last();
                var uid = $lastEntry.data("uid");
                var title = $lastEntry.find('.qe_title').html();

                window.socket.emit("moveMedia", {from: uid, after: window.PL_CURRENT});

                msg = app.t('chatCommands[.]the last video was bumped') + title;

                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistmove');
            }
        },
        '!add': {
            description: app.t('chatCommands[.]adds the video to the end of the playlist (e.g. <i>!add https://www.youtube.com/watch?v=hh4gpgAZkc8</i>)'),
            value: function (msg) {
                var parsed = window.parseMediaLink(msg.split("!add ")[1]);

                if (parsed.id === null) {
                    msg = app.t('chatCommands[.]error: the wrong link');
                } else {
                    window.socket.emit("queue", {id: parsed.id, pos: "end", type: parsed.type});
                    msg = app.t('chatCommands[.]the video was added');
                }


                return msg;
            },
            isAvailable: function () {
                return window.hasPermission('playlistadd');
            }
        },
        
        '!sm': {
            description: app.t('chatCommands[.]show the random emote'),
            value: function () {
                var smilesArray = window.CHANNEL.emotes.map(function (smile) {
                    return smile.name;
                });

                return smilesArray[Math.floor(Math.random() * smilesArray.length)] + ' ';
            }
        },
       
    };


    var IS_COMMAND = false;
    this.prepareMessage = function (msg) {
        IS_COMMAND = false;

        for (var command in this.commandsList) {
            if (this.commandsList.hasOwnProperty(command) && msg.indexOf(command) === 0) {
                if (isCommandPermitted(command) && (this.commandsList[command].isAvailable ? this.commandsList[command].isAvailable() : true)) {
                    IS_COMMAND = true;

                    msg = this.commandsList[command].value(msg);
                }

                break;
            }
        }

        return msg;
    };


    this.sendUserChatMessage = function (e) {
        if(e.keyCode === 13) {
            if (window.CHATTHROTTLE) {
                return;
            }

            var msg = $("#chatline").val().trim();

            if(msg !== '') {
                var meta = {};

                if (window.USEROPTS.adminhat && window.CLIENT.rank >= 255) {
                    msg = "/a " + msg;
                } else if (window.USEROPTS.modhat && window.CLIENT.rank >= window.Rank.Moderator) {
                    meta.modflair = window.CLIENT.rank;
                }

                // The /m command no longer exists, so emulate it clientside
                if (window.CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                    meta.modflair = window.CLIENT.rank;
                    msg = msg.substring(3);
                }


                var msgForCommand = this.prepareMessage(msg);

                if (IS_COMMAND) {
                    window.socket.emit("chatMsg", {msg: msg, meta: meta});
                    window.socket.emit("chatMsg", {msg: 'BillBot: ' + msgForCommand});

                    IS_COMMAND = false;
                } else {
                    window.socket.emit("chatMsg", {msg: msg, meta: meta});
                }


                window.CHATHIST.push($("#chatline").val());
                window.CHATHISTIDX = window.CHATHIST.length;
                $("#chatline").val('');
            }

            return;
        } else if(e.keyCode === 9) { // Tab completion
            window.chatTabComplete();
            e.preventDefault();
            return false;
        } else if(e.keyCode === 38) { // Up arrow (input history)
            if(window.CHATHISTIDX === window.CHATHIST.length) {
                window.CHATHIST.push($("#chatline").val());
            }
            if(window.CHATHISTIDX > 0) {
                window.CHATHISTIDX--;
                $("#chatline").val(window.CHATHIST[window.CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        } else if(e.keyCode === 40) { // Down arrow (input history)
            if(window.CHATHISTIDX < window.CHATHIST.length - 1) {
                window.CHATHISTIDX++;
                $("#chatline").val(window.CHATHIST[window.CHATHISTIDX]);
            }

            e.preventDefault();
            return false;
        }
    };


    $('#chatline, #chatbtn').off();

    $('#chatline').on('keydown', function (e) {
        that.sendUserChatMessage(e);
    });

    $('#chatbtn').on('click', function (e) {
        that.sendUserChatMessage(e);
    });
});

},{}],6:[function(require,module,exports){
require('jquery.selection');

window.cytubeEnhanced.addModule('bbCodesHelper', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        templateButtonsOrder: ['b', 'i', 'sp', 'code', 's'],
        templateButtonsAnimationSpeed: 150
    };
    settings = $.extend({}, defaultSettings, settings);


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.handleMarkdownHelperBtnClick = function ($markdownHelperBtn, $markdownTemplatesWrapper) {
        if ($markdownHelperBtn.hasClass('btn-default')) { //closed
            $markdownHelperBtn.removeClass('btn-default');
            $markdownHelperBtn.addClass('btn-success');

            $markdownTemplatesWrapper.show();
            $markdownTemplatesWrapper.children().animate({left: 0}, settings.templateButtonsAnimationSpeed);
        } else { //opened
            $markdownHelperBtn.removeClass('btn-success');
            $markdownHelperBtn.addClass('btn-default');

            $markdownTemplatesWrapper.children().animate({left: -$markdownTemplatesWrapper.width()}, settings.templateButtonsAnimationSpeed, function () {
                $markdownTemplatesWrapper.hide();
            });
        }
    };

    this.$markdownHelperBtn = $('<button id="markdown-helper-btn" type="button" class="btn btn-sm btn-default" title="' + app.t('markdown[.]Markdown helper') + '">')
        .html('<i class="glyphicon glyphicon-font"></i>')
        .on('click', function () {
            that.handleMarkdownHelperBtnClick($(this), that.$markdownTemplatesWrapper);

            app.userConfig.toggle('bb-codes-opened');
        });

    if ($('#chat-help-btn').length !== 0) {
        this.$markdownHelperBtn.insertBefore('#chat-help-btn');
    } else {
        this.$markdownHelperBtn.appendTo('#chat-controls');
    }


    this.$markdownTemplatesWrapper = $('<div class="btn-group markdown-helper-templates-wrapper">')
        .insertAfter(this.$markdownHelperBtn)
        .hide();

    if (app.userConfig.get('bb-codes-opened')) {
        this.handleMarkdownHelperBtnClick(this.$markdownHelperBtn, this.$markdownTemplatesWrapper);
    }


    /**
     * Markdown templates
     *
     * To add your template you need to also add your template key into settings.templateButtonsOrder
     * @type {object}
     */
    this.markdownTemplates = {
        'b': {
            text: '<b>B</b>',
            title: app.t('markdown[.]Bold text')
        },
        'i': {
            text: '<i>I</i>',
            title: app.t('markdown[.]Cursive text')
        },
        'sp': {
            text: 'SP',
            title: app.t('markdown[.]Spoiler')
        },
        'code': {
            text: '<code>CODE</code>',
            title: app.t('markdown[.]Monospace')
        },
        's': {
            text: '<s>S</s>',
            title: app.t('markdown[.]Strike')
        }
    };

    var template;
    for (var templateIndex = 0, templatesLength = settings.templateButtonsOrder.length; templateIndex < templatesLength; templateIndex++) {
        template = settings.templateButtonsOrder[templateIndex];

        $('<button type="button" class="btn btn-sm btn-default" title="' + this.markdownTemplates[template].title + '">')
            .html(this.markdownTemplates[template].text)
            .data('template', template)
            .appendTo(this.$markdownTemplatesWrapper);
    }


    this.handleMarkdown = function (templateType) {
        if (this.markdownTemplates.hasOwnProperty(templateType)) {
            $('#chatline').selection('insert', {
                text: '[' + templateType + ']',
                mode: 'before'
            });

            $('#chatline').selection('insert', {
                text: '[/' + templateType + ']',
                mode: 'after'
            });
        }
    };
    this.$markdownTemplatesWrapper.on('click', 'button', function () {
        that.handleMarkdown($(this).data('template'));

        return false;
    });
});

},{"jquery.selection":2}],7:[function(require,module,exports){
window.cytubeEnhanced.addModule('chatCommandsHelp', function (app) {
    'use strict';

    var that = this;


    if ($('#chat-controls').length === 0) {
        $('<div id="chat-controls" class="btn-group">').appendTo("#chatwrap");
    }


    this.commands = {};

    this.commands[app.t('Standard commands')] = {
        '/me': app.t('chatCommands[.]%username% action (e.g: <i>/me is dancing</i>)'),
        '/sp': app.t('chatCommands[.]spoiler'),
        '/afk': app.t('chatCommands[.]sets the "AFK" status')
    };

    if (app.isModulePermitted('additionalChatCommands')) {
        app.getModule('additionalChatCommands').done(function (commandsModule) {
            var additionalCommands = {};

            for (var command in commandsModule.commandsList) {
                if (commandsModule.commandsList.hasOwnProperty(command) && (commandsModule.commandsList[command].isAvailable ? commandsModule.commandsList[command].isAvailable() : true)) {
                    additionalCommands[command] = commandsModule.commandsList[command].description || '';
                }
            }

            that.commands[app.t('Extra commands')] = additionalCommands;
        });
    }


    this.handleChatHelpBtn = function (commands) {
        var $bodyWrapper = $('<div>');

        for (var commandsPart in commands) {
            if (commands.hasOwnProperty(commandsPart)) {
                $('<h3>').html(commandsPart).appendTo($bodyWrapper);

                var $ul = $('<ul>');
                for (var command in commands[commandsPart]) {
                    if (commands[commandsPart].hasOwnProperty(command)) {
                        $('<li>').html('<code>' + command + '</code> - ' + commands[commandsPart][command] + '.').appendTo($ul);
                    }
                }

                $ul.appendTo($bodyWrapper);
            }
        }

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow(app.t('The list of chat commands'), $bodyWrapper);
        });
    };
    this.$chatHelpBtn = $('<button id="chat-help-btn" class="btn btn-sm btn-default">')
        .text(app.t(' '))
		.addClass("fa fa-list-alt")
        .appendTo('#chat-controls')
        .on('click', function () {
            that.handleChatHelpBtn(that.commands);
        });
});





},{}],8:[function(require,module,exports){
window.cytubeEnhanced.addModule('videoControls', function (app, settings) {
    'use strict';

    var that = this;

    var defaultSettings = {
        turnOffVideoOption: true,
        selectQualityOption: true,
        expandPlaylistOption: true,
        showVideoContributorsOption: true,
        playlistHeight: 500
    };
    settings = $.extend({}, defaultSettings, settings);

    $('#mediarefresh').hide();


    this.$topVideoControls = $('<div id="top-video-controls" class="btn-group">').appendTo("#videowrap");

    this.refreshVideo = function () {
        $('#mediarefresh').click();
    };
    this.$refreshVideoBtn = $('<button id="refresh-video" class="btn btn-sm btn-default" title="' + app.t('video[.]Refresh video') + '">')
        .html('<i class="glyphicon glyphicon-refresh">')
        .appendTo(this.$topVideoControls)
        .on('click', function () {
            that.refreshVideo();
        });


    this.hidePlayer = function ($hidePlayerBtn) {
        if ($hidePlayerBtn.hasClass('btn-default')) { //video visible
            var $playerWindow = $('#videowrap').find('.embed-responsive');
            $playerWindow.css({position: 'relative'});

            $('<div id="player-overlay">').appendTo($playerWindow);

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-film">');
            $hidePlayerBtn.removeClass('btn-default');
            $hidePlayerBtn.addClass('btn-success');
        } else { //video hidden
            $('#player-overlay').remove();

            $hidePlayerBtn.html('<i class="glyphicon glyphicon-ban-circle">');
            $hidePlayerBtn.removeClass('btn-success');
            $hidePlayerBtn.addClass('btn-default');
        }
    };
    this.$hidePlayerBtn = $('<button id="hide-player-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Hide video') + '">')
        .html('<i class="glyphicon glyphicon-ban-circle">')
        .appendTo(this.$topVideoControls)
        .on('click', function() {
            that.hidePlayer($(this));
        });
    if (!settings.turnOffVideoOption) {
        this.$hidePlayerBtn.hide();
    }


    this.qualityLabelsTranslate = {
        auto: 'auto',
        240: '240p',
        360: '360p',
        480: '480p',
        720: '720p',
        1080: '1080p',
        best: app.t('video[.]crap')
    };
    var qualityLabelsTranslateOrder = ['auto','best', 240, 360, 480, 720, 1080];

    this.$videoQualityBtnGroup = $('<div class="btn-group">')
        .html('<button type="button" class="btn btn-default btn-sm video-dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + app.t('video[.]Quality') + ': ' + this.qualityLabelsTranslate[window.USEROPTS.default_quality || 'auto'] + ' <span class="caret"></span></button>')
        .appendTo(this.$topVideoControls);

    this.$videoQualityList = $('<ul class="dropdown-menu">');
    for (var labelIndex = 0, labelsLength = qualityLabelsTranslateOrder.length; labelIndex < labelsLength; labelIndex++) {
        $('<li>')
            .html('<a href="#" data-quality="' + qualityLabelsTranslateOrder[labelIndex] + '">' + this.qualityLabelsTranslate[qualityLabelsTranslateOrder[labelIndex]] + '</a>')
            .appendTo(this.$videoQualityList);
    }
    this.$videoQualityList.appendTo(this.$videoQualityBtnGroup);

    this.changeVideoQuality = function ($qualityLink) {
        this.settingsFix();
        $("#us-default-quality").val($qualityLink.data('quality'));
        window.saveUserOptions();

        this.$refreshVideoBtn.click();

        this.$videoQualityBtnGroup.find('button').html(app.t('video[.]Quality') + ': ' + $qualityLink.text() + ' <span class="caret"></span>');
        $('.video-dropdown-toggle').dropdown();
    };
    this.$videoQualityBtnGroup.on('click', 'a', function () {
        that.changeVideoQuality($(this));

        return false;
    });

    $("#us-default-quality").on('change', function () {
        that.$videoQualityBtnGroup.find('button').html(app.t('video[.]Quality') + ': ' + that.qualityLabelsTranslate[$(this).val()] + ' <span class="caret"></span>');
    });

    if (!settings.selectQualityOption) {
        this.$videoQualityBtnGroup.hide();
    }


    this.settingsFix = function () {
        $("#us-theme").val(window.USEROPTS.theme);
        $("#us-layout").val(window.USEROPTS.layout);
        $("#us-no-channelcss").prop("checked", window.USEROPTS.ignore_channelcss);
        $("#us-no-channeljs").prop("checked", window.USEROPTS.ignore_channeljs);

        $("#us-synch").prop("checked", window.USEROPTS.synch);
        $("#us-synch-accuracy").val(window.USEROPTS.sync_accuracy);
        $("#us-wmode-transparent").prop("checked", window.USEROPTS.wmode_transparent);
        $("#us-hidevideo").prop("checked", window.USEROPTS.hidevid);
        $("#us-playlistbuttons").prop("checked", window.USEROPTS.qbtn_hide);
        $("#us-oldbtns").prop("checked", window.USEROPTS.qbtn_idontlikechange);
        $("#us-default-quality").val(window.USEROPTS.default_quality || "auto");

        $("#us-chat-timestamp").prop("checked", window.USEROPTS.show_timestamps);
        $("#us-sort-rank").prop("checked", window.USEROPTS.sort_rank);
        $("#us-sort-afk").prop("checked", window.USEROPTS.sort_afk);
        $("#us-blink-title").val(window.USEROPTS.blink_title);
        $("#us-ping-sound").val(window.USEROPTS.boop);
        $("#us-sendbtn").prop("checked", window.USEROPTS.chatbtn);
        $("#us-no-emotes").prop("checked", window.USEROPTS.no_emotes);

        $("#us-modflair").prop("checked", window.USEROPTS.modhat);
        $("#us-joinmessage").prop("checked", window.USEROPTS.joinmessage);
        $("#us-shadowchat").prop("checked", window.USEROPTS.show_shadowchat);
    };


    this.expandPlaylist = function ($expandPlaylistBtn) {
        if ($expandPlaylistBtn.hasClass('btn-success')) {//expanded
            $('#queue').css('max-height', settings.playlistHeight + 'px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Expand playlist'));

            $expandPlaylistBtn.removeClass('btn-success');
            $expandPlaylistBtn.addClass('btn-default');
        } else {//not expanded
            $('#queue').css('max-height', '100000px');

            $expandPlaylistBtn.attr('title', app.t('video[.]Unexpand playlist'));

            $expandPlaylistBtn.removeClass('btn-default');
            $expandPlaylistBtn.addClass('btn-success');

            window.scrollQueue();
        }
    };
    this.$expandPlaylistBtn = $('<button id="expand-playlist-btn" class="btn btn-sm btn-default" data-expanded="0" title="' + app.t('video[.]Expand playlist') + '">')
        .append('<span class="glyphicon glyphicon-resize-full">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.expandPlaylist($(this));
        });
    if (!settings.expandPlaylistOption) {
        this.$expandPlaylistBtn.hide();
    }


    this.$scrollToCurrentBtn = $('<button id="scroll-to-current-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Scroll the playlist to the current video') + '">')
        .append('<span class="glyphicon glyphicon-hand-right">')
        .prependTo('#videocontrols')
        .on('click', function() {
            window.scrollQueue();
        });


    this.showVideoContributorsList = function () {
        var $bodyWrapper = $('<div>');

        var contributorsList = {};
        $("#queue .queue_entry").each(function () {
            var username = $(this).attr('title').replace('Added by: ', '');

            if (contributorsList[username] === undefined) {
                contributorsList[username] = 1;
            } else {
                contributorsList[username] += 1;
            }
        });

        $bodyWrapper.append($('<p>' + app.t('video[.]Video\'s count') + ': ' + ($("#queue .queue_entry").length + 1) + '</p>'));

        var $contributorsListOl = $('<ol>');
        for (var contributor in contributorsList) {
            if (contributorsList.hasOwnProperty(contributor)) {
                $contributorsListOl.append($('<li>' + contributor + ': ' + contributorsList[contributor] + '.</li>'));
            }
        }
        $contributorsListOl.appendTo($bodyWrapper);

        app.getModule('utils').done(function (utilsModule) {
            utilsModule.createModalWindow(app.t('video[.]Contributors\' list'), $bodyWrapper);
        });
    };
    this.$videoContributorsBtn = $('<button id="video-contributors-btn" class="btn btn-sm btn-default" title="' + app.t('video[.]Contributors\' list') + '">')
        .append('<span class="glyphicon glyphicon-user">')
        .prependTo('#videocontrols')
        .on('click', function() {
            that.showVideoContributorsList();
        });
    if (!settings.showVideoContributorsOption) {
        this.$videoContributorsBtn.hide();
    }
});
}],7:[function(require,module,exports){window.cytubeEnhanced.addTranslation("ru",{videoInfo:{"Now:":"Сейчас:","Added by":"Добавлено","Nothing is playing now":"Сейчас ничего не воспроизводится"},tabs:{Title:"Заголовок",Content:"Содержимое","Show tabs settings (cytube enhanced)":"Показать настройки вкладок (cytube enhanced)","Tabs settings":"Настройка вкладок","Channel description":"Описание канала","Add tab":"Добавить вкладку","Remove the last tab":"Удалить последнюю вкладку","Convert to the editor's code":"Преобразовать в код редактора","The code in the editor will be replaced with the new code, continue?":"Код в редакторе будет удалён и заменен новым, продолжить?","Wrong content for the dropdown":"Неправильное содержимое для выпадающего списка: ","Convert from the editor's code":"Преобразовать из кода редактора"},emotes:{"Show emotes":"Показать смайлики"},userConfig:{"Hide header":"Скрывать шапку","Player position":"Положение плеера","Playlist position":"Положение плейлиста","Chat's userlist position":"Позиция списка пользователей чата",Yes:"Да",No:"Нет",Left:"Слева",Right:"Справа",Center:"По центру","Show emotes and favorite images":"Показать смайлики и избранные картинки",Settings:"Настройки",Layout:"Оформление","User CSS":"Пользовательское CSS",Cancel:"Отмена","Reset settings":"Сбросить настройки","All the settings including user css will be reset, continue?":"Все настройки, в том числе и пользовательское CSS будут сброшены, продолжить?",Save:"Сохранить","Layout settings":"Настройки оформления",Minimize:"Минимизировать",Common:"Общее",and:"и"},standardUI:{"Create a poll":"Создать опрос","Add video":"Добавить видео","Add video from url":"Добавить видео по ссылке","connected users":"пользователей","connected user":"пользователь",AFK:"АФК",Anonymous:"Анонимных","Channel Admins":"Администраторов канала",Guests:"Гостей",Moderators:"Модераторов","Regular Users":"Обычных пользователей","Site Admins":"Администраторов сайта","Welcome, ":"Добро пожаловать, ","Log out":"Выйти",Login:"Логин",Password:"Пароль","Remember me":"Запомнить","Log in":"Вход",Home:"На главную",Account:"Аккаунт",Logout:"Выход",Channels:"Каналы",Profile:"Профиль","Change Password/Email":"Изменить пароль/почту",Register:"Регистрация",Options:"Настройки","Channel Settings":"Настройки канала",Layout:"Оформление","Chat Only":"Только чат","Remove Video":"Удалить видео","Video url":"Адрес видео",Next:"Следующим","At end":"В конец",Play:"Проиграть","Queue Next":"Поставить следующим","Make Temporary":"Сделать временным","Make Permanent":"Сделать постоянным",Delete:"Удалить",Name:"Имя","Guest login":"Гостевой вход"},video:{"Refresh video":"Обновить видео","Hide video":"Скрыть видео",crap:"наивысшее",Quality:"Качество","Use Youtube JS Player":"Использовать Youtube JS Player","Expand playlist":"Развернуть плейлист","Unexpand playlist":"Свернуть плейлист","Scroll the playlist to the current video":"Прокрутить плейлист к текущему видео","Contributors' list":"Список пользователей, добавивших видео","Video's count":"Всего видео"},markdown:{"Markdown helper":"Помощник разметки","Bold text":"Жирный текст","Cursive text":"Наклонный текст",Spoiler:"Спойлер",Monospace:"Моноширинный текст",Strike:"Перечёркнутый текст"}})},{}]},{},[4,3,7,6,8]);
