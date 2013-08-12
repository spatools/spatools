define(["require", "exports", "../utils"], function(require, exports, __utils__) {
    /// <reference path="_data.d.ts" />
    var utils = __utils__;
    

    var prefilterInitialized = false, adapters = {};

    function initializePrefilter() {
        if (!prefilterInitialized) {
            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                if (!originalOptions.retryCount || originalOptions.retryCount < 2 || originalOptions.retryDelay === 0)
                    return;

                if (originalOptions.retries) {
                    originalOptions.retries++;
                } else {
                    originalOptions.retries = 1;
                    originalOptions._error = originalOptions.error;
                }

                // overwrite error handler for current request
                options.error = function (_jqXHR, _textStatus, _errorThrown) {
                    if (originalOptions.retries >= originalOptions.retryCount) {
                        if (originalOptions._error)
                            originalOptions._error(_jqXHR, _textStatus, _errorThrown);
                        return;
                    }

                    // Call AJAX again with original options
                    setTimeout(function () {
                        $.ajax(originalOptions);
                    }, originalOptions.retryDelay || 0);
                };
            });

            prefilterInitialized = true;
        }
    }
    exports.initializePrefilter = initializePrefilter;

    function addAdapter(name, adapter) {
        adapters[name] = adapter;
    }
    exports.addAdapter = addAdapter;

    function getAdapter(name) {
        if (!adapters[name]) {
            return utils.load("./adapters/" + name).then(function (adapter) {
                return adapters[name];
            });
        }

        return $.Deferred().resolve(adapters[name]).promise();
    }
    exports.getAdapter = getAdapter;
});
