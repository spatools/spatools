define(["require", "exports", "../utils"], function(require, exports, __utils__) {
    /// <reference path="_data.d.ts" />
    var utils = __utils__;
    

    var stores = {};

    function addStoreType(name, store) {
        stores[name] = store;
    }
    exports.addStoreType = addStoreType;

    function getStore(name, context) {
        var dfd = (!stores[name]) ? utils.load("./stores/" + name).then(function () {
            return new stores[name](context);
        }) : $.Deferred().resolve(new stores[name](context));

        return dfd.then(function (store) {
            return store.init(true).then(function () {
                return store;
            });
        });
    }
    exports.getStore = getStore;
});
