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

    private ajax(url: string, type: string = "GET", data?: any): JQueryPromise<any> {
        var options: JQueryAjaxSettings = {
            url: url,
            type: type,
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay
        };

        if (data)
            options.data = data;

        return $.ajax(options);
    }

    /** Get entity collection filtered by query (if provided) (GET) */
    public getAll(controller: string, query?: query.ODataQuery): JQueryPromise<any> {
        var url = this.options.baseUrl + controller;

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }
    /** Get a single entity (GET) */
    public getOne(controller: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }

    /** Create an entity (POST) */
    public post(controller: string, data: any): JQueryPromise<any> {
        var url = this.options.baseUrl + controller;
        return this.ajax(url, "POST", data);
    }
    /** Updates an entity (PUT) */
    public put(controller: string, id: any, data: any): JQueryPromise<any> {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);
        return this.ajax(url, "PUT", data);
    }
    /** Deletes an entity (DELETE) */
    public remove(controller: string, id: any): JQueryPromise<any> {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);
        return this.ajax(url, "DELETE");
    }

    public getRelation(controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
        var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id) + "/" + relationName;

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }
    public action(controller: string, action: string, parameters: any, id?: any): JQueryPromise<any> {
        var url = this.options.baseUrl + controller + (id ? "/" + encodeURIComponent(id) : "") + "/" + action;
        return this.ajax(url, "POST", parameters);
    }
}

adapters.addAdapter("webapi", new WebApiAdapter());

export = WebApiAdapter;
