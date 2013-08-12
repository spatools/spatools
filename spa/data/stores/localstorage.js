var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./memory"], function(require, exports, __memory__) {
    
    var memory = __memory__;

    var cachePrefix = "__SPA_DATA__";

    var LocalStorageStore = (function (_super) {
        __extends(LocalStorageStore, _super);
        function LocalStorageStore() {
            _super.apply(this, arguments);
        }
        LocalStorageStore.prototype.initSet = function (set) {
            var table = this.getStoreTable(set.setName);
            for (var key in table) {
                table[key] = set.fromJS(table[key]);
            }

            this.memory[set.setName] = table;
        };

        LocalStorageStore.prototype.getStoreTable = function (setName) {
            return JSON.parse(localStorage.getItem(cachePrefix + setName)) || {};
        };
        LocalStorageStore.prototype.setStoreTable = function (setName, setValue) {
            localStorage.setItem(cachePrefix + setName, JSON.stringify(setValue));
        };

        LocalStorageStore.prototype.init = function (force) {
            var _this = this;
            return $.Deferred(function () {
                setTimeout(function () {
                    if (force)
                        _.each(_this.context.getSets(), _this.initSet, _this);
                });
            }).promise();
        };

        LocalStorageStore.prototype.add = function (setName, item) {
            var _this = this;
            var key = this.getKey(setName, item), currentSet = this.context[setName];

            _super.prototype.add.call(this, setName, item);

            setTimeout(function () {
                var table = _this.getStoreTable(setName);
                table[key] = currentSet.toJS(item, true);
                _this.setStoreTable(setName, table);
            }, 1);
        };
        LocalStorageStore.prototype.update = function (setName, item) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.update.call(this, setName, item);

            setTimeout(function () {
                var table = _this.getStoreTable(setName), key = _this.getKey(setName, item);

                table[key] = currentSet.toJS(item, true);
                _this.setStoreTable(setName, table);
            }, 1);
        };
        LocalStorageStore.prototype.remove = function (setName, key) {
            var _this = this;
            _super.prototype.remove.call(this, setName, key);

            setTimeout(function () {
                var table = _this.getStoreTable(setName);

                if (table[key]) {
                    delete table[key];
                    _this.setStoreTable(setName, table);
                }
            }, 1);
        };

        LocalStorageStore.prototype.addRange = function (setName, items) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.addRange.call(this, setName, items);

            setTimeout(function () {
                var table = _this.getStoreTable(setName);

                _.each(items, function (item) {
                    var key = _this.getKey(setName, item);
                    table[key] = currentSet.toJS(item, true);
                });

                _this.setStoreTable(setName, table);
            }, 1);
        };
        LocalStorageStore.prototype.updateRange = function (setName, items) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.updateRange.call(this, setName, items);

            setTimeout(function () {
                var table = _this.getStoreTable(setName);

                _.each(items, function (item) {
                    var key = _this.getKey(setName, item);
                    table[key] = currentSet.toJS(item, true);
                });

                _this.setStoreTable(setName, table);
            }, 1);
        };
        LocalStorageStore.prototype.removeRange = function (setName, keys) {
            var _this = this;
            _super.prototype.removeRange.call(this, setName, keys);

            setTimeout(function () {
                var table = _this.getStoreTable(setName);

                _.each(keys, function (key) {
                    if (table[key])
                        delete table[key];
                });

                _this.setStoreTable(setName, table);
            }, 1);
        };
        return LocalStorageStore;
    })(memory);

    
    return LocalStorageStore;
});
