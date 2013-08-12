define(["require", "exports", "./messenger", "./utils"], function(require, exports, __messenger__, __utils__) {
    /// <reference path="_definitions.d.ts" />
    var messenger = __messenger__;
    var utils = __utils__;

    /** Create an async operation which result can be cached and progress can be tracked */
    function Operation(options) {
        var cache = options.cache || false, cacheDuration = options.cacheDuration || 60 * 5, useArgs = options.useArguments || false, message = options.message || null, lastExecution = null, memory = null, isExecuting = ko.observable(false), progress = ko.observable(0), progressDetails = ko.observable({}), error = ko.observable(""), errorDetails = ko.observable({}), hasError = ko.computed(function () {
            return utils.isNullOrWhiteSpace(error());
        }), onComplete = function () {
            var args = Array.prototype.slice.call(arguments, 0);

            if (_.isFunction(options.complete))
                options.complete.apply(this, args);

            if (message)
                messenger.publish(message + "Response", args);

            if (cache === true && !lastExecution) {
                memory = args;
                lastExecution = Date.now();
            }

            isExecuting(false);
            error("");
            errorDetails({});
            progress(0);
            progressDetails({});
        }, onError = function (_error, _errorDetails) {
            if (_.isFunction(options.error))
                options.error.apply(this, arguments);

            error(_error);
            errorDetails(_errorDetails);
            isExecuting(false);
        }, onProgress = function (_progress, _progressDetails) {
            if (_.isFunction(options.progress))
                options.progress.apply(this, arguments);

            progress(_progress);
            progressDetails(_progressDetails);
        }, execute = function () {
            var args = [onComplete, onError, onProgress];
            progress(-1);
            isExecuting(true);

            if (cache === true && !!lastExecution) {
                if (lastExecution + cacheDuration < Date.now())
                    return onComplete.apply(null, memory); else
                    lastExecution = memory = null;
            }

            if (useArgs)
                args.unshift(Array.prototype.slice.call(arguments, 0));

            if (_.isFunction(options.execute)) {
                options.execute.apply(this, args);
            }
        };

        if (message)
            messenger.subscribe(message + "Request", execute);

        execute.isExecuting = isExecuting;
        execute.progress = progress;
        execute.progressDetails = progressDetails;
        execute.error = error;
        execute.errorDetails = errorDetails;
        execute.hasError = hasError;

        return execute;
    }

    
    return Operation;
});
