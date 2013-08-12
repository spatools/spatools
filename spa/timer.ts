/// <reference path="_definitions.d.ts" />

class Timer {
    //#region Properties

    private tickCount: number = 0;
    private timeout: number = 0;

    /**
     * Constructs a new AsyncTimer
     * @param interval Interval between two timer iteration
     * @param callback Callback to be called when timer ticks
     * @param callBackContext Context (this) to be applied to callback when timer ticks
     * @param enabled Specifiy whether the timer need to be started directly
     * @param callOnFirstStart Specify whether the timer must start directly with a call to specified callback
     */
    constructor(
        private interval: number,
        private callback: () => any,
        private callBackContext: any = null,
        private enabled: boolean = false,
        private callOnFirstStart: boolean = false) {
            
            if (enabled && callback) {
                this.start()
            }
    }

    //#endregion

    //#region Getters / Setters

    /** Get the total number of ticks elapsed since timer started. */
    getTickCount = function (): number {
        return this.tickCount;
    }

    /** Set a new interval for the current timer. */
    setInterval = function (interval: number): void {
        this.interval = interval * 1;
    }

    /** Set a new callback to be called when timer ticks. */
    setCallback = function (callback: () => any): void {
        this.callback = callback;
    }

    //#endregion

    //#region Public Methods

    /** Start current timer. */
    start = function (callOnFirstStart: boolean = false): void {
        if (!this.callback)
            throw new Error("callback is not defined, define callback before start");

        this.enabled = true;

        if (callOnFirstStart || this.callOnFirstStart)
            this.callback.call(this.callBackContext);

        this.setTimeout();
    }

    /** Stop current timer. */
    stop = function (): void {
        if (this.enabled) {
            this.enabled = false;
            clearTimeout(this.timeout);
        }
    }

    /** Reset current timer by setting tick count to 0. */
    reset = function () {
        this.tickCount = 0;
    }

    //#endregion

    //#region Private Methods

    private setTimeout = function () {
        this.timeout = setTimeout(function () {
            this.onTimerTick.apply(this, arguments);
        }, this.interval);
    }

    private onTimerTick = function () {
        this.tickCount += this.interval;
        this.callback.call(this.callBackContext);

        if (this.enabled) {
            this.setTimeout();
        }
    };

    //#endregion
}

export = Timer;