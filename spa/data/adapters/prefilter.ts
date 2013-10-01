var isInitialized: boolean = false;

export function initialize(): void {
    if (!isInitialized) {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            // retry not set or less than 2 : retry not requested // no timeout was setup
            if (!originalOptions.retryCount || originalOptions.retryCount < 2 || originalOptions.retryDelay === 0) {
                return;
            }

            if (originalOptions.retries) {
                originalOptions.retries++; // increment retry count each time
            } else {
                originalOptions.retries = 1; // init the retry count if not set
                originalOptions._error = originalOptions.error; // copy original error callback on first time
            }

            // overwrite error handler for current request
            options.error = function (_jqXHR, _textStatus, _errorThrown) {
                // retry max was exhausted or it is not a timeout error
                if (originalOptions.retries >= originalOptions.retryCount) { // || _textStatus !== 'timeout') {
                    if (originalOptions._error) originalOptions._error(_jqXHR, _textStatus, _errorThrown); // call original error handler if any
                    return;
                }
                // Call AJAX again with original options
                setTimeout(function () { $.ajax(originalOptions); }, originalOptions.retryDelay || 0);
            };
        });

        isInitialized = true;
    }
}
