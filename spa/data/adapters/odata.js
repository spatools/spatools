define(["require", "exports", "../adapters", "../guid", "../../utils"], function(require, exports, __adapters__, __guid__, __utils__) {
    /// <reference path="../_data.d.ts" />
    var adapters = __adapters__;
    var guid = __guid__;
    
    var utils = __utils__;

    var urls = {
        entitySet: '{controller}',
        entity: '{controller}({key})',
        entitySetAction: '{controller}/{action}',
        entityAction: '{controller}({key})/{action}'
    };

    var ODataAdapter = (function () {
        function ODataAdapter() {
            this.options = {
                baseUrl: "/api/",
                retryCount: 0,
                retryDelay: 0
            };
            adapters.initializePrefilter();
        }
        ODataAdapter.prototype.generateKey = function (key) {
            var _this = this;
            if (guid.isGuid(key))
                return "guid'" + key + "'";

            if (utils.isDate(key))
                return "datetime'" + key + "'";

            if (typeof key === "string")
                return "'" + encodeURIComponent(key) + "'";

            if (_.isObject(key))
                return _.map(key, function (v, i) {
                    return i + "=" + _this.generateKey(v);
                }).join(", ");

            return key;
        };
        ODataAdapter.prototype.generateUrl = function (url) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var _this = this;
            var regex = /\{([^}]*)\}/;

            while (args.length && regex.test(url)) {
                url = url.replace(regex, function (match) {
                    if (match.indexOf('key') !== -1)
                        return _this.generateKey(args.shift());

                    return args.shift();
                });
            }

            return this.options.baseUrl + url;
        };

        /** Get entity collection filtered by query (if provided) (GET) */
        ODataAdapter.prototype.getAll = function (controller, query) {
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
        };

        /** Get a single entity (GET) */
        ODataAdapter.prototype.getOne = function (controller, id) {
            var url = this.generateUrl(urls.entity, controller, id);

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
        ODataAdapter.prototype.post = function (controller, data) {
            var url = this.generateUrl(urls.entitySet, controller);

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
        ODataAdapter.prototype.put = function (controller, id, data) {
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
        };

        /** Deletes an entity (DELETE) */
        ODataAdapter.prototype.remove = function (controller, id) {
            var url = this.generateUrl(urls.entity, controller, id);

            return $.ajax({
                url: url,
                type: "DELETE",
                contentType: "application/json",
                dataType: "text json",
                retryCount: this.options.retryCount,
                retryDelay: this.options.retryDelay
            });
        };

        ODataAdapter.prototype.getRelation = function (controller, relationName, id, query) {
            var url = this.generateUrl(urls.entityAction, controller, id, relationName);

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
        ODataAdapter.prototype.action = function (controller, action, parameters, id) {
            var url = this.generateUrl(id ? urls.entityAction : urls.entitySetAction, controller, id ? id : action, action);

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
        return ODataAdapter;
    })();

    adapters.addAdapter("odata", new ODataAdapter());

    
    return ODataAdapter;
});
