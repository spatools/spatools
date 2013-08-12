define(["require", "exports", "../stores"], function(require, exports, __stores__) {
    /// <reference path="../_data.d.ts" />
    var stores = __stores__;
    

    var MemoryStore = (function () {
        function MemoryStore(context) {
            this.context = context;
            this.memory = {};
        }
        MemoryStore.prototype.init = function (force) {
            return $.when();
        };

        /* return set key or item key if specified */
        MemoryStore.prototype.getKey = function (setName, item) {
            return item ? this.context[setName].getKey(item) : this.context[setName].key;
        };
        MemoryStore.prototype.getMemorySet = function (setName) {
            if (!this.memory[setName])
                this.memory[setName] = {};

            return this.memory[setName];
        };

        MemoryStore.prototype.getAll = function (setName) {
            return _.values(this.getMemorySet(setName));
        };
        MemoryStore.prototype.getOne = function (setName, key) {
            var table = this.getMemorySet(setName);
            return table[key];
        };

        MemoryStore.prototype.add = function (setName, item) {
            var table = this.getMemorySet(setName), key = this.getKey(setName, item);

            table[key] = item;
        };

        /* Nothing because all observable but to override to update specific stores */
        MemoryStore.prototype.update = function (setName, item) {
        };
        MemoryStore.prototype.remove = function (setName, key) {
            var table = this.getMemorySet(setName);
            delete table[key];
        };

        MemoryStore.prototype.addRange = function (setName, items) {
            var table = this.getMemorySet(setName);

            _.each(items, function (item) {
                var key = this.getKey(setName, item);
                table[key] = item;
            }, this);
        };

        /* Nothing because all observable but to override to update specific stores */
        MemoryStore.prototype.updateRange = function (setName, items) {
        };
        MemoryStore.prototype.removeRange = function (setName, keys) {
            var table = this.getMemorySet(setName);
            _.each(keys, function (key) {
                delete table[key];
            }, this);
        };
        return MemoryStore;
    })();

    stores.addStoreType("memory", MemoryStore);

    
    return MemoryStore;
});
