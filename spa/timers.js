define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var Timer = (function () {
        /**
        * Constructs a new AsyncTimer
        * @param interval Interval between two timer iteration
        * @param callback Callback to be called when timer ticks
        * @param callBackContext Context (this) to be applied to callback when timer ticks
        * @param enabled Specifiy whether the timer need to be started directly
        * @param callOnFirstStart Specify whether the timer must start directly with a call to specified callback
        */
        function Timer(interval, callback, callBackContext, enabled, callOnFirstStart) {
            if (typeof callBackContext === "undefined") { callBackContext = null; }
            if (typeof enabled === "undefined") { enabled = false; }
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            this.interval = interval;
            this.callback = callback;
            this.callBackContext = callBackContext;
            this.enabled = enabled;
            this.callOnFirstStart = callOnFirstStart;
            //#region Properties
            this.tickCount = 0;
            this.timeout = 0;
            //#endregion
            //#region Getters / Setters
            /** Get the total number of ticks elapsed since timer started. */
            this.getTickCount = function () {
                return this.tickCount;
            };
            /** Set a new interval for the current timer. */
            this.setInterval = function (interval) {
                this.interval = interval * 1;
            };
            /** Set a new callback to be called when timer ticks. */
            this.setCallback = function (callback) {
                this.callback = callback;
            };
            //#endregion
            //#region Public Methods
            /** Start current timer. */
            this.start = function (callOnFirstStart) {
                if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
                if (!this.callback)
                    throw new Error("callback is not defined, define callback before start");

                this.enabled = true;

                if (callOnFirstStart || this.callOnFirstStart)
                    this.callback.call(this.callBackContext);

                this.setTimeout();
            };
            /** Stop current timer. */
            this.stop = function () {
                if (this.enabled) {
                    this.enabled = false;
                    clearTimeout(this.timeout);
                }
            };
            /** Reset current timer by setting tick count to 0. */
            this.reset = function () {
                this.tickCount = 0;
            };
            //#endregion
            //#region Private Methods
            this.setTimeout = function () {
                this.timeout = setTimeout(function () {
                    this.onTimerTick.apply(this, arguments);
                }, this.interval);
            };
            this.onTimerTick = function () {
                this.tickCount += this.interval;
                this.callback.call(this.callBackContext);

                if (this.enabled) {
                    this.setTimeout();
                }
            };
            if (enabled && callback) {
                this.start();
            }
        }
        return Timer;
    })();
    exports.Timer = Timer;

    var AsyncTimer = (function () {
        /**
        * Constructs a new AsyncTimer
        * @param interval Interval between two timer iteration
        * @param callback Callback to be called when timer ticks
        * @param callBackContext Context (this) to be applied to callback when timer ticks
        * @param enabled Specifiy whether the timer need to be started directly
        * @param callOnFirstStart Specify whether the timer must start directly with a call to specified callback
        */
        function AsyncTimer(interval, callback, callBackContext, enabled, callOnFirstStart) {
            if (typeof callBackContext === "undefined") { callBackContext = null; }
            if (typeof enabled === "undefined") { enabled = false; }
            if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
            this.interval = interval;
            this.callback = callback;
            this.callBackContext = callBackContext;
            this.enabled = enabled;
            this.callOnFirstStart = callOnFirstStart;
            //#region Properties
            this.tickCount = 0;
            this.timeout = 0;
            //#endregion
            //#region Getters / Setters
            /** Get the total number of ticks elapsed since timer started. */
            this.getTickCount = function () {
                return this.tickCount;
            };
            /** Set a new interval for the current timer. */
            this.setInterval = function (interval) {
                this.interval = interval * 1;
            };
            /** Set a new callback to be called when timer ticks. */
            this.setCallback = function (callback) {
                this.callback = callback;
            };
            //#endregion
            //#region Public Methods
            /** Start current timer. */
            this.start = function (callOnFirstStart) {
                if (typeof callOnFirstStart === "undefined") { callOnFirstStart = false; }
                if (!this.callback)
                    throw new Error("callback is not defined, define callback before start");

                this.enabled = true;

                if (callOnFirstStart || this.callOnFirstStart)
                    this.callback.call(this.callBackContext, this.completeCallback);
            };
            /** Stop current timer. */
            this.stop = function () {
                if (this.enabled) {
                    this.enabled = false;
                    clearTimeout(this.timeout);
                }
            };
            /** Reset current timer by setting tick count to 0. */
            this.reset = function () {
                this.tickCount = 0;
            };
            //#endregion
            //#region Private Methods
            this.setTimeout = function () {
                this.timeout = setTimeout(function () {
                    this.onTimerTick.apply(this, arguments);
                }, this.interval);
            };
            this.onTimerTick = function () {
                this.tickCount += this.interval;
                this.callback.call(this.callBackContext, this.completeCallback);
            };
            this.completeCallback = function () {
                if (this.enabled) {
                    this.setTimeout();
                }
            };
            if (enabled && callback) {
                this.start();
            }
        }
        return AsyncTimer;
    })();
    exports.AsyncTimer = AsyncTimer;
});
