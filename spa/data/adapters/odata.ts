/// <reference path="../_data.d.ts" />

import adapters = require("../adapters");
import guid = require("../guid");
import query = require("../query");
import utils = require("../../utils");

var urls = {
    entitySet: '{controller}',
    entity: '{controller}({key})',
    entitySetAction: '{controller}/{action}',
    entityAction: '{controller}({key})/{action}',
};

class ODataAdapter implements adapters.IAdapter {
    private options = {
        baseUrl: "/api/",
        retryCount: 0,
        retryDelay: 0
    };

    constructor() {
        adapters.initializePrefilter();
    }

    private generateKey(key: any): string {
	    if (guid.isGuid(key))
            return "guid'" + key + "'";

        if (utils.isDate(key))
            return "datetime'" + key + "'";

        if (typeof key === "string")
            return "'" + encodeURIComponent(key) + "'";

        if (_.isObject(key))
            return _.map(key, (v, i?) => i + "=" + this.generateKey(v)).join(", ");

        return key;
    }
    private generateUrl(url: string, ...args: string[]): string {
	    var regex = /\{([^}]*)\}/;

        while (args.length && regex.test(url)) {
            url = url.replace(regex, match => {
                if (match.indexOf('key') !== -1)
                    return this.generateKey(args.shift());

                return args.shift();
            });
        }

        return this.options.baseUrl + url;
    }

    /** Get entity collection filtered by query (if provided) (GET) */
	public getAll(controller: string, query?: query.ODataQuery): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entitySet, controller);

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
    public getOne(controller: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id); 

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

    /** Create an entity (POST) */
    public post(controller: string, data: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entitySet, controller); 

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
    public put(controller: string, id: any, data: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id); 

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
    public remove(controller: string, id: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id);

        return $.ajax({
            url: url,
            type: "DELETE",
            contentType: "application/json",
            dataType: "text json",
            retryCount: this.options.retryCount,
            retryDelay: this.options.retryDelay,
        })
    }

    public getRelation(controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entityAction, controller, id, relationName);

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
    public action(controller: string, action: string, parameters: any, id?: any): JQueryPromise<any> {
	    var url = this.generateUrl(id ? urls.entityAction : urls.entitySetAction, controller, id ? id : action, action); 

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

adapters.addAdapter("odata", new ODataAdapter());

export = ODataAdapter;