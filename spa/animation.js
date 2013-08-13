define(["require", "exports", "./utils", "./event"], function(require, exports, __utils__, __event__) {
    /// <reference path="_definitions.d.ts" />
    var utils = __utils__;
    var event = __event__;

    /** Launch given animation on the given element */
    function launch(element, animationName, options, completed) {
        if (!options || !options.duration)
            throw "An animation duration must be set";

        var animProp = utils.prefixStyle("animation"), prefix = utils.getVendorPrefix(), eventName = prefix && prefix !== "" ? prefix + "AnimationEnd" : "animationend", animStyle = [];

        animStyle.push(animationName);
        animStyle.push(options.duration + "ms");

        if (options.easing)
            animStyle.push(options.easing);

        if (options.delay)
            animStyle.push(options.delay + "ms");

        if (options.iteration)
            animStyle.push(options.iteration);

        if (options.direction)
            animStyle.push(options.direction);

        if (options.fill)
            animStyle.push(options.fill);

        event.once(element, eventName, function () {
            if (options.fill !== "forwards")
                element.style[animProp] = "";

            if (completed)
                completed.apply(this, arguments);
        });

        if (element.style[animProp] !== "" && element.style[animProp].indexOf(animationName) !== -1)
            element.style[animProp] = "";

        setTimeout(function () {
            element.style[animProp] = animStyle.join(" ");
        }, 1);
    }
    exports.launch = launch;

    /** Launch given animation on the given element */
    function transitionTo(element, from, to, options, completed) {
        if (!options || !options.duration)
            throw "A transition duration must be set";

        var transitionProp = utils.prefixStyle("transition"), transitionStyle = [], prefix = utils.getVendorPrefix(), eventName = prefix && prefix !== "" ? prefix + "TransitionEnd" : "transitionend";

        transitionStyle.push(options.duration + "ms");

        if (options.easing)
            transitionStyle.push(options.easing);

        if (options.delay)
            transitionStyle.push(options.delay + "ms");

        if (from) {
            for (var prop in from) {
                element.style[utils.prefixStyle(prop)] = from[prop];
            }
        }

        event.once(element, eventName, function () {
            element.style[transitionProp] = "";

            if (completed)
                completed.apply(this, arguments);
        });

        setTimeout(function () {
            element.style[transitionProp] = transitionStyle.join(" ");

            for (var prop in to) {
                element.style[utils.prefixStyle(prop)] = to[prop];
            }
        }, 1);
    }
    exports.transitionTo = transitionTo;
});
