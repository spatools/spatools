define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var AsyncCommand = (function () {
        function AsyncCommand(options) {
            this.isExecuting = ko.observable(false);
            this.execute = function ($data) {
                if (this.canExecute() === true) {
                    var args = [];

                    if (this.executeCallback.length === 2)
                        args.push($data);

                    args.push(this.completeCallback);

                    this.isExecuting(true);
                    this.executeCallback.apply(this.context, args);
                }
            };
            this.canExecuteCallback = options.canExecute;
            this.executeCallback = options.execute;
            this.context = options.context;

            this.canExecute = ko.computed(function () {
                return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context, this.isExecuting()) : true;
            }, this);
        }
        return AsyncCommand;
    })();

    
    return AsyncCommand;
});
