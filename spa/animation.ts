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

/** Launch given animation on the given element */
export function launch(element: HTMLElement, animationName: string, options: AnimationOptions, completed?: () => any): void {
    if (!options || !options.duration) {
        throw "An animation duration must be set";
    }

    var animProp = utils.prefixStyle("animation"),
        prefix = utils.getVendorPrefix(),
        eventName = prefix && prefix !== "" ? prefix + "AnimationEnd" : "animationend",
        animStyle = [];

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

/** Launch given animation on the given element */
export function transitionTo(element: HTMLElement, from: { [key: string]: any }, to: { [key: string]: any }, options: TransitionOptions, completed?: () => any): void {
    if (!options || !options.duration) {
        throw "A transition duration must be set";
    }

    var transitionProp = utils.prefixStyle("transition"),
        transitionStyle = [],
        prefix = utils.getVendorPrefix(),
        eventName = prefix && prefix !== "" ? prefix + "TransitionEnd" : "transitionend";

    transitionStyle.push(options.duration + "ms");
    
    if (options.easing)
        transitionStyle.push(options.easing);

    if (options.delay)
        transitionStyle.push(options.delay + "ms");

    if (from) {
        _.each(from, (value, prop) => element.style[utils.prefixStyle(prop)] = value);
    }

    event.once(element, eventName, function () {
        element.style[transitionProp] = "";
        completed && completed.apply(this, arguments);
    });

    setTimeout(function () {
        element.style[transitionProp] = transitionStyle.join(" ");
        _.each(to, (value, prop) => element.style[utils.prefixStyle(prop)] = value);
    }, 1);
}
