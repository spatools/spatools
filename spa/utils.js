define(["require", "exports"], function(require, exports) {
    exports.isIE = /*@cc_on!@*/ 0;

    //#region Knockout Utilities
    /** Create value accessor for custom bindings. */
    function createAccessor(value) {
        return function () {
            return value;
        };
    }
    exports.createAccessor = createAccessor;

    /** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
    function createObservable(value, _default) {
        if (_.isUndefined(value) || _.isNull(value))
            return ko.observable(_default);

        if (ko.isSubscribable(value))
            return value;

        return ko.observable(value);
    }
    exports.createObservable = createObservable;

    /** Return an observable from value (or _default if undefined). If value is subscribable, returns value directly. */
    function createObservableArray(value, mapFunction, context) {
        if (typeof value === "undefined")
            return ko.observableArray();

        if (ko.isSubscribable(value) && _.isArray(value()))
            return value;

        if (_.isArray(value) && typeof mapFunction === "function")
            value = _.map(value, mapFunction, context);

        return ko.observableArray(value);
    }
    exports.createObservableArray = createObservableArray;

    //#endregion
    //#region Check Methods
    /** Test if value is undefined. */
    function isUndefined(value) {
        return typeof value === "undefined";
    }
    exports.isUndefined = isUndefined;

    /** Test if value is a date. */
    function isDate(value) {
        return /\d{2,4}-\d{2}-\d{2}[T -_]\d{2}:\d{2}:\d{2}/.test(value);
    }
    exports.isDate = isDate;

    /** Test if value is null or a white space. */
    function isNullOrWhiteSpace(value) {
        return !value || (/^\s*$/).test(value);
    }
    exports.isNullOrWhiteSpace = isNullOrWhiteSpace;

    //#endregion
    //#region Utility Methods
    /** Copy all properties from all object passed in arguments in the first object passed in arguments. */
    function extend(target) {
        var objs = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            objs[_i] = arguments[_i + 1];
        }
        if (objs.length === 0) {
            return target;
        }

        for (var i = 0; i < objs.length; i++) {
            var obj = objs[i];
            if (!obj)
                continue;

            for (var prop in obj) {
                target[prop] = obj[prop];
            }
        }

        return target;
    }
    exports.extend = extend;

    /** Make inheritance operation. */
    function inherits(obj, base, prototype) {
        if (base.constructor == Function) {
            //Normal Inheritance
            obj.prototype = new base();
            obj.prototype.constructor = obj;
            obj.prototype.parent = base.prototype;
        } else {
            //Pure Virtual Inheritance
            obj.prototype = base;
            obj.prototype.constructor = obj;
            obj.prototype.parent = base;
        }

        if (prototype) {
            exports.extend(obj.prototype, prototype);
        }

        return obj;
    }
    exports.inherits = inherits;

    /** Execute callback methods in a safe DOM modification environment. Usefull when creating HTML5 Application. */
    function unsafe(callback) {
        if (typeof MSApp === "undefined")
            callback.call(null); else
            MSApp.execUnsafeLocalFunction(callback);
    }
    exports.unsafe = unsafe;

    /** Get current window size. */
    function getWindowSize() {
        var winW = 630, winH = 460;

        if (document.body && document.body.offsetWidth) {
            winW = document.body.offsetWidth;
            winH = document.body.offsetHeight;
        }

        if (document.compatMode === 'CSS1Compat' && document.documentElement && document.documentElement.offsetWidth) {
            winW = document.documentElement.offsetWidth;
            winH = document.documentElement.offsetHeight;
        }

        if (window.innerWidth && window.innerHeight) {
            winW = window.innerWidth;
            winH = window.innerHeight;
        }

        return {
            width: winW,
            height: winH
        };
    }
    exports.getWindowSize = getWindowSize;

    /** Get query strings. If a key is specified, returns only query string for specified key. */
    function getQueryString(key) {
        var dictionary = {}, qs = window.location.search.replace('?', ''), pairs = qs.split('&');

        _.each(pairs, function (val) {
            var pair = val.split('=');
            dictionary[pair[0]] = pair[1];
        });

        if (key)
            return dictionary[key];

        return dictionary;
    }
    exports.getQueryString = getQueryString;

    /** Load specified modules using RequireJS under a promise. */
    function load() {
        var modules = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            modules[_i] = arguments[_i + 0];
        }
        return $.Deferred(function (dfd) {
            var args = _.flatten(modules, true);

            try  {
                require(args, dfd.resolve);
            } catch (ex) {
                dfd.reject(ex);
            }
        }).promise();
    }
    exports.load = load;

    //#endregion
    //#region String Methods
    /** Fill given text with given char while text length < given length */
    function str_pad(text, length, char, right) {
        if (typeof right === "undefined") { right = false; }
        var str = '' + text;
        while (str.length < length) {
            str = right ? str + char : char + str;
        }

        return str;
    }
    exports.str_pad = str_pad;

    function arrayCompare(array1, array2) {
        return {
            added: _.difference(array2, array1),
            removed: _.difference(array1, array2)
        };
    }
    exports.arrayCompare = arrayCompare;

    function arrayEquals(array1, array2) {
        var report = exports.arrayCompare(array1, array2);
        return report.added.length === 0 && report.removed.length === 0;
    }
    exports.arrayEquals = arrayEquals;

    //#endregion
    //#region Prefix Methods
    /** Get current vendor prefix */
    function getVendorPrefix() {
        if ('result' in arguments.callee)
            return arguments.callee.result;

        var regex = /^(moz|webkit|Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/, someScript = document.getElementsByTagName('script')[0];

        for (var prop in someScript.style) {
            if (regex.test(prop)) {
                // test is faster than match, so it's better to perform
                // that on the lot and match only when necessary
                return arguments.callee.result = prop.match(regex)[0];
            }
        }

        if ('webkitOpacity' in someScript.style)
            return arguments.callee.result = 'webkit';
        if ('KhtmlOpacity' in someScript.style)
            return arguments.callee.result = 'Khtml';

        return arguments.callee.result = '';
    }
    exports.getVendorPrefix = getVendorPrefix;

    /** Prefix specified property using actual vendor prefix */
    function prefixStyle(prop) {
        if ($.support[prop])
            return $.support[prop];

        var vendorProp, supportedProp, capProp = prop.charAt(0).toUpperCase() + prop.slice(1), prefixes = ["webkit", "moz", "o", "Moz", "Webkit", "O", "ms"], div = document.createElement("div");

        if (prop in div.style) {
            supportedProp = prop;
        } else {
            for (var i = 0; i < prefixes.length; i++) {
                vendorProp = prefixes[i] + capProp;
                if (vendorProp in div.style) {
                    supportedProp = vendorProp;
                    break;
                }
            }
        }

        // avoid memory leak in IE
        div = null;

        // add property to $.support so it can be accessed elsewhere
        $.support[prop] = supportedProp;

        return supportedProp;
    }
    exports.prefixStyle = prefixStyle;

    /** Create a jQuery CSS Hook for specified property */
    function createCssHook(prop) {
        var property = exports.prefixStyle(prop);
        if (property && property !== prop) {
            $.cssHooks[prop] = {
                get: function (elem, computed, extra) {
                    return $.css(elem, property);
                },
                set: function (elem, value) {
                    elem.style[property] = value;
                }
            };
        }
    }
    exports.createCssHook = createCssHook;
});
