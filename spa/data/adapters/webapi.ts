/// <reference path="../_data.d.ts" />

import adapters = require("../adapters");
import guid = require("../guid");
import query = require("../query");
import utils = require("../../utils");

class WebApiAdapter implements adapters.IAdapter {
    private options = {
        baseUrl: "/api/",
        retryCount: 0,
        retryDelay: 0
    };

    constructor() {
        adapters.initializePrefilter();
    }

    /** Get entity collection filtered by query (if provided) (GET) */
    public getAll(controller: string, query?: query.ODataQuery): JQueryPromise {
        var url = this.options.baseUrl + controller;

        if (query)
            url = url + "?" + query.toQueryString();

        return $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay
        });
    }
    /** Get a single entity (GET) */
    public getOne(controller: string, id: any): JQueryPromise {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

        return $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay
        });
    }

    /** Create an entity (POST) */
    public post(controller: string, data: any): JQueryPromise {
        var url = this.options.baseUrl + controller;

        return $.ajax({
            url: url,
            type: "POST",
            contentType: "application/json",
            data: data,
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay,
        });
    }
    /** Updates an entity (PUT) */
    public put(controller: string, id: any, data: any): JQueryPromise {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

        return $.ajax({
            url: url,
            type: "PUT",
            contentType: "application/json",
            data: data,
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay
        });
    }
    /** Deletes an entity (DELETE) */
    public remove(controller: string, id: any): JQueryPromise {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

        return $.ajax({
            url: url,
            type: "DELETE",
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay,
        });
    }

    public getRelation(controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id) + "/" + relationName;

        if (query)
            url = url + "?" + query.toQueryString();

        return $.ajax({
            url: url,
            type: "GET",
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay,
        });
    }
    public action(controller: string, action: string, parameters: any, id?: any): JQueryPromise {
        var url = this.options.baseUrl + controller + (id ? "/" + encodeURIComponent(id) : "") + "/" + action;

        return $.ajax({
            url: url,
            type: "POST",
            contentType: "application/json",
            data: parameters,
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay,
        });
    }
}

adapters.addAdapter("webapi", new WebApiAdapter());

export = WebApiAdapter;