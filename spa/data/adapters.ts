/// <reference path="_data.d.ts" />

import utils = require("../utils");
import query = require("./query");

export interface IAdapter {
    getAll(controller: string, query?: query.ODataQuery): JQueryPromise<any>;
    getOne(controler: string, id: any, query?: query.ODataQuery): JQueryPromise<any>;
    getRelation? (controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<any>;

    post(controller: string, data: any): JQueryPromise<any>;
    put(controller: string, id: any, data: any): JQueryPromise<any>;
    remove(controller: string, id: any): JQueryPromise<any>;

    action? (controller: string, action: string, parameters: any, id?: any): JQueryPromise<any>;
}

var prefilterInitialized: boolean = false,
    adapters = {};

export function initializePrefilter(): void {
    if (!prefilterInitialized) {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            // retry not set or less than 2 : retry not requested // no timeout was setup
            if (!originalOptions.retryCount || originalOptions.retryCount < 2 || originalOptions.retryDelay === 0)
                return;

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

        prefilterInitialized = true;
    }
}

export function addAdapter(name: string, adapter: IAdapter): void {
    adapters[name] = adapter;
}

export function getAdapter(name: string): JQueryPromise<IAdapter> {
    if (!adapters[name]) {
        return utils.load("./data/adapters/" + name).then(adapter => adapters[name]);
    }

    return $.when(adapters[name]);
}