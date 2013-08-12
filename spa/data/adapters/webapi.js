define(["require", "exports", "../adapters"], function(require, exports, __adapters__) {
    /// <reference path="../_data.d.ts" />
    var adapters = __adapters__;
    
    
    

    var WebApiAdapter = (function () {
        function WebApiAdapter() {
            this.options = {
                baseUrl: "/api/",
                retryCount: 0,
                retryDelay: 0
            };
            adapters.initializePrefilter();
        }
        /** Get entity collection filtered by query (if provided) (GET) */
        WebApiAdapter.prototype.getAll = function (controller, query) {
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
        };

        /** Get a single entity (GET) */
        WebApiAdapter.prototype.getOne = function (controller, id) {
            var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

            return $.ajax({
                url: url,
                type: "GET",
                contentType: "application/json",
                dataType: "text json",
                retryCount: this.options.retryCount,
                retryDelay: this.options.retryDelay
            });
        };

        /** Create an entity (POST) */
        WebApiAdapter.prototype.post = function (controller, data) {
            var url = this.options.baseUrl + controller;

            return $.ajax({
                url: url,
                type: "POST",
                contentType: "application/json",
                data: data,
                dataType: "text json",
                retryCount: this.options.retryCount,
                retryDelay: this.options.retryDelay
            });
        };

        /** Updates an entity (PUT) */
        WebApiAdapter.prototype.put = function (controller, id, data) {
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
        };

        /** Deletes an entity (DELETE) */
        WebApiAdapter.prototype.remove = function (controller, id) {
            var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id);

            return $.ajax({
                url: url,
                type: "DELETE",
                contentType: "application/json",
                dataType: "text json",
                retryCount: this.options.retryCount,
                retryDelay: this.options.retryDelay
            });
        };

        WebApiAdapter.prototype.getRelation = function (controller, relationName, id, query) {
            var url = this.options.baseUrl + controller + "/" + encodeURIComponent(id) + "/" + relationName;

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
        };
        WebApiAdapter.prototype.action = function (controller, action, parameters, id) {
            var url = this.options.baseUrl + controller + (id ? "/" + encodeURIComponent(id) : "") + "/" + action;

            return $.ajax({
                url: url,
                type: "POST",
                contentType: "application/json",
                data: parameters,
                dataType: "text json",
                retryCount: this.options.retryCount,
                retryDelay: this.options.retryDelay
            });
        };
        return WebApiAdapter;
    })();

    adapters.addAdapter("webapi", new WebApiAdapter());

    
    return WebApiAdapter;
});
