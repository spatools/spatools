/// <reference path="_definitions.d.ts" />

import utils = require("./utils");

export interface CommandOptions {
    execute($data: any): any;
    canExecute? (): boolean;
    context?: any;
}

export interface AsyncCommandOptions {
    execute($data: any, complete: () => void ): any;
    canExecute? (isExecuting: boolean): boolean;
    context?: any;
}

export class Command {
    private canExecuteCallback: () => boolean;
    private executeCallback: ($data: any) => any;
    private context: any;

    public canExecute: KnockoutComputed<boolean>;
    
    constructor(options: CommandOptions) {
        this.canExecuteCallback = options.canExecute;
        this.executeCallback = options.execute;
        this.context = options.context;

        this.canExecute = ko.computed<boolean>(function () {
            return this.canExecuteCallback ? this.canExecuteCallback.call(this.context) : true;
        }, this);
    }

    public execute($data: any): void {
        if (this.canExecute() === true)
            this.executeCallback.call(this.context, $data);
    }
}

export class AsyncCommand {
    private canExecuteCallback: (isExecuting: boolean) => boolean;
    private executeCallback: ($data: any, complete: () => void ) => any;
    private context: any;
    public isExecuting: KnockoutObservable<boolean> = ko.observable(false);

    public canExecute: KnockoutComputed<boolean>;

    constructor(options: AsyncCommandOptions) {
        this.canExecuteCallback = options.canExecute;
        this.executeCallback = options.execute;
        this.context = options.context;

        this.canExecute = ko.computed<boolean>(function () {
            return this.canExecuteCallback ? this.canExecuteCallback.call(this.context, this.isExecuting()) : true;
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

            args.push(_.bind(this.completeCallback, this));

            this.isExecuting(true);
            this.executeCallback.apply(this.context, args);
        }
    }
}


ko.bindingHandlers.command = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor(),
            commands = !!value.execute ? { click: value } : value,
            events = {},
            bindings = {};

        _.each(commands, function (command, event?) {
            if (ko.bindingHandlers[event]) {
                bindings[event] = _.bind(command.execute, command);
            } else {
                events[event] = _.bind(command.execute, command);
            }
        }),

        _.each(bindings, function (bindingValue, binding?) {
            ko.bindingHandlers[binding].init(element, utils.createAccessor(bindingValue), allBindingsAccessor, viewModel, bindingContext);
        });

        if (_.size(events) > 0)
            ko.bindingHandlers.event.init(element, utils.createAccessor(events), allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor(),
            commands = !!value.execute ? { click: value } : value,
            result = true;

        _.find(commands, function (command) {
            result = command.canExecute();
            return !result;
        });

        ko.bindingHandlers.enable.update(element, utils.createAccessor(result), allBindingsAccessor, viewModel, bindingContext);
    }
};
