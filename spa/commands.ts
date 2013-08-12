/// <reference path="_definitions.d.ts" />

export interface CommandOptions {
    execute(): any;
    canExecute? (): boolean;
    context?: any;
}

export interface AsyncCommandOptions {
    execute($data: any, complete?: () => void ): any;
    canExecute? (isExecuting?: boolean): boolean;
    context?: any;
}

export class Command {
    private canExecuteCallback: () => bool;
    private executeCallback: () => any;
    private context: any;

    public canExecute: KnockoutComputed<bool>;
    
    constructor(options: CommandOptions) {
        this.canExecuteCallback = options.canExecute;
        this.executeCallback = options.execute;
        this.context = options.context;

        this.canExecute = ko.computed(function () {
            return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context) : true;
        }, this);
    }

    public execute($data: any): void {
        if (this.canExecute() === true)
            this.executeCallback.call(this.context, $data);
    }
}

export class AsyncCommand {
    private canExecuteCallback: (isExecuting?: bool) => bool;
    private executeCallback: ($data: any, complete?: () => void ) => any;
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

    private completeCallback(): void {
        this.isExecuting(false);
    }

    public execute($data: any): void {
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