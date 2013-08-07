define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var Command = (function () {
        function Command(options) {
            this.execute = function ($data) {
                if (this.canExecute() === true)
                    this.executeCallback.call(this.context, $data);
            };
            this.canExecuteCallback = options.canExecute;
            this.executeCallback = options.execute;
            this.context = options.context;

            this.canExecute = ko.computed(function () {
                return this.canExecuteCallBack ? this.canExecuteCallBack.call(this.context) : true;
            }, this);
        }
        return Command;
    })();

    
    return Command;
});
