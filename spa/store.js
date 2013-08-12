define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var stores = {};
    function createFromIStorage(type, storage) {
        stores[type] = storage;
    }

    //#region Create Available Stores
    var MemoryStorage = (function () {
        function MemoryStorage() {
            this.memory = {};
            this.timeouts = {};
            this.length = 0;
            this.clone = function (obj) {
                return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
            };
            this.key = function (index) {
                return _.find(_.values(this.memory), function (val, i) {
                    return i === index;
                });
            };
            this.getItem = function (key) {
                return this.clone(this.memory[key]);
            };
            this.setItem = function (key, value) {
                this.memory[key] = value;
            };
            this.removeItem = function (key) {
                delete this.memory[key];
            };
            this.clear = function () {
                this.memory = {};
                return null;
            };
        }
        return MemoryStorage;
    })();
    createFromIStorage("memory", new MemoryStorage());

    _.each(["localStorage", "sessionStorage"], function (storageType) {
        try  {
            if (window[storageType] && window[storageType].getItem) {
                createFromIStorage(storageType, window[storageType]);
            }
        } catch (e) {
        }
    });

    if (window.globalStorage) {
        try  {
            createFromIStorage("globalStorage", window.globalStorage[window.location.hostname]);
        } catch (e) {
        }
    }

    //#endregion
    //#region Initialize best available storage
    var _store = stores.localStorage;

    if (!_store) {
        _store = stores.sessionStorage;
        if (stores.globalStorage)
            _store = stores.globalStorage;
    }

    if (!_store)
        _store = stores.memory;

    //#endregion
    //#eregion Public Methods
    exports.length = 0;

    function key(index) {
        var result = _store.key(index);
        exports.length = _store.length;
        return result;
    }
    exports.key = key;
    function getItem(key) {
        var result = _store.getItem(key);
        exports.length = _store.length;
        return result;
    }
    exports.getItem = getItem;
    function setItem(key, data) {
        _store.setItem(key, data);
        exports.length = _store.length;
    }
    exports.setItem = setItem;
    function removeItem(key) {
        _store.removeItem(key);
        exports.length = _store.length;
    }
    exports.removeItem = removeItem;
    function clear() {
        _store.clear();
        exports.length = _store.length;
    }
    exports.clear = clear;

    function changeStore(type) {
        if (stores[type]) {
            _store = stores[type];
            exports.length = _store.length;
        }
    }
    exports.changeStore = changeStore;
    function addStorageType(type, store, change) {
        if (stores[type])
            throw "This store already exists !";

        if (_.isNumber(store.length) && store.clear && store.getItem && store.setItem && store.key && store.removeItem) {
            createFromIStorage(type, store);
        }

        if (change === true) {
            exports.changeStore(type);
        }
    }
    exports.addStorageType = addStorageType;
});
