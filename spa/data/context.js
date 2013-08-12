define(["require", "exports", "./mapping", "./stores", "./adapters", "./dataset"], function(require, exports, __mapping__, __stores__, __adapters__, __dataset__) {
    /// <reference path="_data.d.ts" />
    var mapping = __mapping__;
    var stores = __stores__;
    var adapters = __adapters__;
    var dataset = __dataset__;

    var DataContext = (function () {
        function DataContext() {
            this.sets = {};
            this.buffer = false;
            this.autoLazyLoading = false;
            this.mapping = new mapping.Configurations();
        }
        /** Get Mapping Configuration for specified type */
        DataContext.prototype.getMappingConfiguration = function (type) {
            return this.mapping.getConfiguration(type);
        };

        /** Add a mapping configuration to this data context */
        DataContext.prototype.addMappingConfiguration = function (config) {
            this.mapping.addConfiguration(config);
            return this;
        };

        /** Get all sets defined in current context */
        DataContext.prototype.getSets = function () {
            return _.toArray(this.sets);
        };

        /** Get set from name */
        DataContext.prototype.getSet = function (name) {
            return this.sets[name];
        };

        /** Add a new Data Set to the Data Context */
        DataContext.prototype.addSet = function (name, keyProperty, defaultType) {
            if (!this.sets[name])
                this[name] = this.sets[name] = dataset.create(name, keyProperty, defaultType, this);

            return this.sets[name];
        };

        /** Initialize context with default store and adapter */
        DataContext.prototype.initDefault = function () {
            return $.when(this.setLocalStore("memory"), this.setAdapter("odata"));
        };

        /** change local store type */
        DataContext.prototype.setLocalStore = function (storeType) {
            var _this = this;
            return stores.getStore(storeType, this).then(function (store) {
                return _this.store = store;
            });
        };

        /** change remote adapter type */
        DataContext.prototype.setAdapter = function (adapterType) {
            var _this = this;
            return adapters.getAdapter(adapterType).then(function (adapter) {
                return _this.adapter = adapter;
            });
        };
        return DataContext;
    })();
    exports.DataContext = DataContext;

    function create(storeType, adapterType, buffer, autoLazyLoading) {
        if (typeof storeType === "undefined") { storeType = "memory"; }
        if (typeof adapterType === "undefined") { adapterType = "odata"; }
        if (typeof buffer === "undefined") { buffer = false; }
        if (typeof autoLazyLoading === "undefined") { autoLazyLoading = false; }
        var context = new DataContext();

        context.buffer = buffer;
        context.autoLazyLoading = autoLazyLoading;

        return $.when(context.setLocalStore(storeType), context.setAdapter(adapterType)).then(function () {
            return context;
        });
    }
    exports.create = create;
});
