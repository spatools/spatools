/// <reference path="_definitions.d.ts" />

class AsyncCommand {
    private canExecuteCallback: (isExecuting?: bool) => bool;
    private executeCallback: ($data: any, complete?: () => void) => any;
    private context: any;
    public isExecuting: KnockoutObservable<bool> = ko.observable(false);

    public canExecute: KnockoutComputed<bool>;

    constructor(options: AsyncCommandOptions) {
        this.canExecuteCallback = options.canExecute;
        this.executeCallback = options.execute;
        this.context = options.context;

        this.canExecute = ko.computed(function () {
            return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context, this.isExecuting()) : true;
        }, this);
    }

    public execute = function ($data) {
        if (this.canExecute() === true) {
            var args = [];

            if (this.executeCallback.length === 2)
                args.push($data);

            args.push(this.completeCallback);

            this.isExecuting(true);
            this.executeCallback.apply(this.context, args);
        }
    }
}

export = AsyncCommand;