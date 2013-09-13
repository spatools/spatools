/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

import timers = require("../spa/timers");

export function run() {
    module("Timers Tests");

    asyncTest("timer.simple", () => {
        expect(4);

        var iteration = 0,
            timer = new timers.Timer(10, () => ok(++iteration, "Timer tick count : " + iteration + ", max : 3"));

        timer.start();

        setTimeout(() => {
            timer.stop();

            equal(iteration, 3, "Timer interval = 10ms, so after 40ms, timer must have ticked 3 times");

            start();
        }, 40);
    });

    asyncTest("timer.async", () => {
        expect(4);

        var iteration = 0,
            callback = complete => {
                ok(++iteration, "Timer tick count : " + iteration + ", max : 3");
                setTimeout(complete, 5);
            },
            timer = new timers.AsyncTimer(10, callback);

        timer.start();

        setTimeout(() => {
            timer.stop();

            equal(iteration, 3, "Timer interval: 10ms, callback duration: 5ms, so after 60ms, timer must have ticked 3 times");

            start();
        }, 60);
    });
}