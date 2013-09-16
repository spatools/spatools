/// <reference path="_definitions.d.ts" />

export class Timer {
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
        private callback: () => void,
        private callBackContext: any = null,
        private enabled: boolean = false,
        private callOnFirstStart: boolean = false) {

        if (enabled && callback) {
            this.start();
        }
    }

    //#endregion

    //#region Getters / Setters

    /** Get the total number of ticks elapsed since timer started. */
    getTickCount(): number {
        return this.tickCount;
    }

    /** Set a new interval for the current timer. */
    setInterval(interval: number): void {
        this.interval = interval * 1;
    }

    /** Set a new callback to be called when timer ticks. */
    setCallback(callback: () => void): void {
        this.callback = callback;
    }

    //#endregion

    //#region Public Methods

    /** Start current timer. */
    public start(callOnFirstStart: boolean = false): void {
        if (!this.callback) {
            throw new Error("callback is not defined, define callback before start");
        }

        this.enabled = true;

        if (callOnFirstStart || this.callOnFirstStart)
            this.callback.call(this.callBackContext);

        this.setTimeout();
    }

    /** Stop current timer. */
    public stop(): void {
        if (this.enabled) {
            this.enabled = false;
            clearTimeout(this.timeout);
        }
    }

    /** Reset current timer by setting tick count to 0. */
    public reset(): void {
        this.tickCount = 0;
    }

    //#endregion

    //#region Private Methods

    private setTimeout(): void {
        this.timeout = setTimeout(() => {
            this.onTimerTick.apply(this, arguments);
        }, this.interval);
    }

    private onTimerTick(): void {
        this.tickCount += this.interval;
        this.callback.call(this.callBackContext);

        if (this.enabled) {
            this.setTimeout();
        }
    }

    //#endregion
}

export class AsyncTimer {
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
        private callback: (complete: () => void) => void,
        private callBackContext: any = null,
        private enabled: boolean = false,
        private callOnFirstStart: boolean = false) {

        if (enabled && callback) {
            this.start();
        }
    }

    //#endregion

    //#region Getters / Setters

    /** Get the total number of ticks elapsed since timer started. */
    getTickCount(): number {
        return this.tickCount;
    }

    /** Set a new interval for the current timer. */
    setInterval(interval: number): void {
        this.interval = interval * 1;
    }

    /** Set a new callback to be called when timer ticks. */
    setCallback(callback: (complete: () => void ) => void): void {
        this.callback = callback;
    }

    //#endregion

    //#region Public Methods

    /** Start current timer. */
    public start(callOnFirstStart: boolean = false): void {
        if (!this.callback) {
            throw new Error("callback is not defined, define callback before start");
        }

        this.enabled = true;

        if (callOnFirstStart || this.callOnFirstStart)
            this.callback.call(this.callBackContext, this.completeCallback);
        else
            this.setTimeout();
    }

    /** Stop current timer. */
    public stop(): void {
        if (this.enabled) {
            this.enabled = false;
            clearTimeout(this.timeout);
        }
    }

    /** Reset current timer by setting tick count to 0. */
    public reset(): void {
        this.tickCount = 0;
    }

    //#endregion

    //#region Private Methods

    private setTimeout(): void {
        this.timeout = setTimeout(() => {
            this.onTimerTick.apply(this, arguments);
        }, this.interval);
    }

    private onTimerTick(): void {
        this.tickCount += this.interval;
        this.callback.call(this.callBackContext, _.bind(this.completeCallback, this));
    }

    private completeCallback(): void {
        if (this.enabled) {
            this.setTimeout();
        }
    }

    //#endregion
}
