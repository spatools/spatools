/// <reference path="_definitions.d.ts" />

import utils = require("./utils");
import event = require("./event");

export interface AnimationOptions {
    duration: number;
    delay: number;
    easing: string;
    fill: string;
    iteration: number;
    direction: string;
}

export interface TransitionOptions {
    duration: number;
    delay: number;
    easing: string;
}

//#region Private Methods
var prefix = null;
var names = {
    animation: { style: null, event: null },
    transition: { style: null, event: null }
};

function upperFirst(input: string): string {
    return input.slice(0, 1).toUpperCase() + input.slice(1);
}

function ensureNames(type: string) {
    var current = names[type], tmp;
    if (current.style && current.event) {
        return;
    }

    if (!current.style)
        current.style = utils.prefixStyle(type);

    tmp = type + "end";
    if (event.check(tmp)) {
        current.event = tmp;
    }
    else {
        if (!prefix) prefix = utils.getVendorPrefix();

        tmp = prefix + upperFirst(type) + "End";
        if (event.check(tmp)) current.event = tmp;

        tmp = upperFirst(tmp);
        if (event.check(tmp)) current.event = tmp;
    }

    if (!current.event) {
        current.event = "timeout";
    }
}
function ensureEvent(type: string, element: HTMLElement, options: TransitionOptions, callback: () => any) {
    ensureNames(type);
    var current = names[type];

    if (current.event === "timeout") {
        setTimeout(callback, (options.delay || 0) + options.duration);
    }
    else {
        event.once(element, current.event, callback);
    }
}

//#endregion

/** Launch given animation on the given element */
export function launch(element: HTMLElement, animationName: string, options: AnimationOptions, completed?: () => any): void {
    if (!options || !options.duration) {
        throw new Error("An animation duration must be set");
    }

    ensureNames("animation");
    var animStyle = [],
        animProp = names.animation.style;

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

    ensureEvent("animation", element, options, function () {
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

/** Launch given animation on the given element */
export function transitionTo(element: HTMLElement, from: { [key: string]: any }, to: { [key: string]: any }, options: TransitionOptions, completed?: () => any): void {
    if (!options || !options.duration) {
        throw new Error("A transition duration must be set");
    }

    ensureNames("transition");
    var transitionStyle = [],
        transitionProp = names.transition.style;

    transitionStyle.push(options.duration + "ms");
    
    if (options.easing)
        transitionStyle.push(options.easing);

    if (options.delay)
        transitionStyle.push(options.delay + "ms");

    if (from) {
        _.each(from, (value, prop) => element.style[utils.prefixStyle(prop)] = value);
    }

    ensureEvent("transition", element, options, function () {
        element.style[transitionProp] = "";
        completed && completed.apply(this, arguments);
    });

    setTimeout(function () {
        element.style[transitionProp] = transitionStyle.join(" ");
        _.each(to, (value, prop) => element.style[utils.prefixStyle(prop)] = value);
    }, 1);
}
