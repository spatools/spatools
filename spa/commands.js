define(["require", "exports"], function(require, exports) {
    var Command = (function () {
        function Command(options) {
            this.canExecuteCallback = options.canExecute;
            this.executeCallback = options.execute;
            this.context = options.context;

            this.canExecute = ko.computed(function () {
                return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context) : true;
            }, this);
        }
        Command.prototype.execute = function ($data) {
            if (this.canExecute() === true)
                this.executeCallback.call(this.context, $data);
        };
        return Command;
    })();
    exports.Command = Command;

    var AsyncCommand = (function () {
        function AsyncCommand(options) {
            this.isExecuting = ko.observable(false);
            this.canExecuteCallback = options.canExecute;
            this.executeCallback = options.execute;
            this.context = options.context;

            this.canExecute = ko.computed(function () {
                return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context, this.isExecuting()) : true;
            }, this);
        }
        AsyncCommand.prototype.completeCallback = function () {
            this.isExecuting(false);
        };

        AsyncCommand.prototype.execute = function ($data) {
            if (this.canExecute() === true) {
                var args = [];

                if (this.executeCallback.length === 2)
                    args.push($data);

                args.push(this.completeCallback);

                this.isExecuting(true);
                this.executeCallback.apply(this.context, args);
            }
        };
        return AsyncCommand;
    })();
    exports.AsyncCommand = AsyncCommand;
});
