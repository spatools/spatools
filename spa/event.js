define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    /** Trigger event of given type on the target element */
    function trigger(element, eventType, eventArgs) {
        var evt;
        if (document.createEvent) {
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(eventType, true, true);
        } else {
            evt = document.createEventObject();
            evt.eventType = eventType;
        }

        evt.eventName = eventType;
        ko.utils.extend(evt, eventArgs);

        if (document.createEvent) {
            element.dispatchEvent(evt);
        } else {
            element.fireEvent("on" + event.eventType, evt);
        }
    }
    exports.trigger = trigger;

    /** Attach the given handler to given event types */
    function attach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var t = 0, len = types.length; t < len; t++) {
            if (element.addEventListener) {
                element.addEventListener(types[t], handler, false);
            } else if (document.attachEvent) {
                element.attachEvent("on" + types[t], handler);
            }
        }
    }
    exports.attach = attach;

    /** Detach the given handler from given event types */
    function detach(element, eventTypes, handler) {
        var types = eventTypes.split(" ");
        for (var t = 0, len = types.length; t < len; t++) {
            if (element.removeEventListener) {
                element.removeEventListener(types[t], handler, false);
            } else if (document.detachEvent) {
                element.detachEvent("on" + types[t], handler);
            }
        }
    }
    exports.detach = detach;

    /** Attach the given handler to given event types and detach it on the first call */
    function once(element, eventTypes, handler) {
        var fn = function () {
            handler.apply(this, arguments);
            exports.detach(element, eventTypes, fn);
        };

        exports.attach(element, eventTypes, fn);
    }
    exports.once = once;

    /** Check existence of given event name */
    function check(eventName) {
        var tagnames = { 'select': 'input', 'change': 'input', 'submit': 'form', 'reset': 'form', 'error': 'img', 'load': 'img', 'abort': 'img' };
        var element = document.createElement(tagnames[eventName] || 'div');

        eventName = 'on' + eventName;
        var isSupported = (eventName in element);

        if (!isSupported) {
            element.setAttribute(eventName, 'return;');
            isSupported = typeof element[eventName] === 'function';
        }

        element = null;

        return isSupported;
    }
    exports.check = check;

    function stopPropagation(event) {
        if (!event)
            event = window.event;

        if (event.stopPropagation)
            event.stopPropagation(); else
            event.cancelBubble = true;
    }
    exports.stopPropagation = stopPropagation;

    function preventDefault(event) {
        if (!event)
            event = window.event;
        if (event.preventDefault)
            event.preventDefault();
        event.returnValue = false;

        return false;
    }
    exports.preventDefault = preventDefault;

    function getTarget(event) {
        if (!event)
            event = window.event;
        return event.target || event.srcElement;
    }
    exports.getTarget = getTarget;
});
