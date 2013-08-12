/// <reference path="_definitions.d.ts" />

class Command {
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

    public execute = function ($data) {
        if (this.canExecute() === true)
            this.executeCallback.call(this.context, $data);
    }
}

export = Command;