/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

import timers = require("../spa/timers");

export function run() {
    module("Timers Tests");

    asyncTest("timer.simple", () => {
        expect(1);

        var iteration = 0,
            timer = new timers.Timer(10, () => { ++iteration; });

        timer.start();

        setTimeout(() => {
            timer.stop();

            ok(iteration > 1, "Timer interval = 10ms, so after 40ms, timer must have ticked more than 1 time");

            start();
        }, 40);
    });

    asyncTest("timer.async", () => {
        expect(1);

        var iteration = 0,
            timer = new timers.AsyncTimer(10, complete => { ++iteration; setTimeout(complete, 5); });

        timer.start();

        setTimeout(() => {
            timer.stop();

            ok(iteration > 1, "Timer interval: 10ms, callback duration: 5ms, so after 50ms, timer must have ticked more than 1 time");

            start();
        }, 50);
    });
}