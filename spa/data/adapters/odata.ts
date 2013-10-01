/// <reference path="../_data.d.ts" />

import adapters = require("../adapters");
import guid = require("../guid");
import query = require("../query");
import utils = require("../../utils");

var urls = {
    entitySet: "{controller}",
    entity: "{controller}({key})",
    entitySetAction: "{controller}/{action}",
    entityAction: "{controller}({key})/{action}",
};

class ODataAdapter implements adapters.IAdapter {
    private options = {
        baseUrl: "/data/",
        retryCount: 0,
        retryDelay: 0
    };

    constructor() {
        adapters.initializePrefilter();
    }

    private generateKey(key: any): string {
        if (guid.isGuid(key)) {
            return "guid'" + key + "'";
        }

        if (utils.isDate(key)) {
            return "datetime'" + key + "'";
        }

        if (typeof key === "string") {
            return "'" + encodeURIComponent(key) + "'";
        }

        if (_.isObject(key)) {
            return _.map(key, (v, i?) => i + "=" + this.generateKey(v)).join(", ");
        }

        return key;
    }
    private generateUrl(url: string, ...args: string[]): string {
        var regex = /\{([^}]*)\}/,
            matchFunction = match => {
                if (match.indexOf("key") !== -1) {
                    return this.generateKey(args.shift());
                }

                return args.shift();
            };

        while (args.length && regex.test(url)) {
            url = url.replace(regex, matchFunction);
        }

        return this.options.baseUrl + url;
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
	    var url = this.generateUrl(urls.entitySet, controller);

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }
    /** Get a single entity (GET) */
    public getOne(controller: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id);

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }

    /** Create an entity (POST) */
    public post(controller: string, data: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entitySet, controller);
        return this.ajax(url, "POST", data);
    }
    /** Updates an entity (PUT) */
    public put(controller: string, id: any, data: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id);
        return this.ajax(url, "PUT", data);
    }
    /** Deletes an entity (DELETE) */
    public remove(controller: string, id: any): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entity, controller, id);
        return this.ajax(url, "DELETE");
    }

    public getRelation(controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
	    var url = this.generateUrl(urls.entityAction, controller, id, relationName);

        if (query)
            url = url + "?" + query.toQueryString();

        return this.ajax(url);
    }
    public action(controller: string, action: string, parameters: any, id?: any): JQueryPromise<any> {
	    var url = this.generateUrl(id ? urls.entityAction : urls.entitySetAction, controller, id ? id : action, action);
        return this.ajax(url, "POST", parameters);
    }
}

adapters.addAdapter("odata", new ODataAdapter());

export = ODataAdapter;
