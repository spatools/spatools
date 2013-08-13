define(["require", "exports", "./utils", "./event"], function(require, exports, __utils__, __event__) {
    /// <reference path="_definitions.d.ts" />
    var utils = __utils__;
    var event = __event__;

    var api = {
        /** Specify whether full-screen API is supported or not */
        isSupported: false,
        /** Specify whether using IE full-screen API */
        isIE: false,
        /** Get if window is currently in full-screen mode */
        isFullScreen: function () {
            return false;
        },
        /** Request full-screen mode */
        requestFullScreen: function () {
        },
        /** Exit full-screen mode */
        exitFullScreen: function () {
        },
        /** Get current fullscreenchange eventName */
        eventName: "",
        /** Get current vendor prefix */
        prefix: ""
    };

    var prefixes = ["", "webkit", "moz", "o", "ms", "khtml"], nativeRequest = ["requestFullscreen", "requestFullScreen"], prefixRequest = ["RequestFullscreen", "RequestFullScreen"], nativeCancel = ["cancelFullscreen", "cancelFullScreen", "exitFullscreen"], prefixCancel = ["CancelFullscreen", "CancelFullScreen", "ExitFullscreen"];

    //IsSupported
    _.find(prefixes, function (prefix) {
        api.prefix = prefix;
        _.find(prefix !== "" ? nativeCancel : prefixCancel, function (cancel) {
            if (!utils.isUndefined(document[prefix + cancel])) {
                api.isSupported = true;
                return true;
            }
        });

        if (api.isSupported)
            return true;
    });

    if (!api.isSupported && !utils.isUndefined(window.ActiveXObject)) {
        api.isSupported = true;
        api.isIE = true;
    }

    if (api.isSupported === true) {
        if (api.isIE) {
            var isFullScreen = false;
            api.requestFullScreen = api.exitFullScreen = function () {
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys('{F11}');
                    isFullScreen = !isFullScreen;
                }
            };
            api.isFullScreen = function () {
                return isFullScreen;
            };
        } else {
            _.find(api.prefix !== "" ? nativeCancel : prefixCancel, function (cancel) {
                if (!utils.isUndefined(document[api.prefix + cancel])) {
                    api.exitFullScreen = document[api.prefix + cancel];
                    return true;
                }
            });
            _.find(api.prefix !== "" ? nativeRequest : prefixRequest, function (request) {
                if (!utils.isUndefined(document.documentElement[api.prefix + request])) {
                    api.requestFullScreen = document.documentElement[api.prefix + request];
                    return true;
                }
            });
            api.isFullScreen = function () {
                switch (this.prefix) {
                    case '':
                        return document.fullScreen;
                    case 'webkit':
                        return document.webkitIsFullScreen;
                    default:
                        return document[this.prefix + 'FullScreen'];
                }
            };
            if (event.check("fullscreenchange"))
                api.eventName = "fullscreenchange"; else if (event.check(api.prefix + "fullscreenchange"))
                api.eventName = api.prefix + "fullscreenchange";
        }
    }

    ko.bindingHandlers.fullscreen = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            if (api.isSupported) {
                var onClick = function () {
                    var options = ko.utils.unwrapObservable(valueAccessor()), icon = ko.utils.unwrapObservable(options.icon), cancelIcon = ko.utils.unwrapObservable(options.cancelIcon), isFullScreen = ko.utils.unwrapObservable(options.isFullScreen);

                    if (api.isFullScreen()) {
                        api.exitFullScreen();
                    } else {
                        api.requestFullScreen();
                    }
                };

                ko.bindingHandlers.click.init(element, utils.createAccessor(onClick), allBindingsAccessor, viewModel, bindingContext);
            }
        }
    };

    
    return api;
});
