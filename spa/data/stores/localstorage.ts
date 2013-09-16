/// <reference path="../_data.d.ts" />

import stores = require("../stores");
import memory = require("./memory");

var cachePrefix = "__SPA_DATA__";

class LocalStorageStore extends memory {
    private initSet(set) {
        var table = this.getStoreTable(set.setName);
        _.each(table, (value, key) => table[key] = set.fromJS(value));
        this.memory[set.setName] = table;
    }
    
    private getStoreTable(setName: string): {} {
        return JSON.parse(localStorage.getItem(cachePrefix + setName)) || {};
    }
    private setStoreTable(setName: string, setValue: {}) {
        localStorage.setItem(cachePrefix + setName, JSON.stringify(setValue));
    }

    init(force?: boolean): JQueryPromise<any> {
        return $.Deferred(() => {
            setTimeout(() => {
                if (force)
                    _.each(this.context.getSets(), this.initSet, this);
            });
        }).promise();
    }

    add(setName: string, item: any): void {
        var key = this.getKey(setName, item),
            currentSet = this.context[setName];

        super.add(setName, item);

        setTimeout(() => {
            var table = this.getStoreTable(setName);
            table[key] = currentSet.toJS(item, true);
            this.setStoreTable(setName, table);
        }, 1);
    }
    update(setName: string, item: any): void {
        var currentSet = this.context[setName];

        super.update(setName, item);

        setTimeout(() => {
            var table = this.getStoreTable(setName),
                key = this.getKey(setName, item);

            table[key] = currentSet.toJS(item, true);
            this.setStoreTable(setName, table);
        }, 1);
    }
    remove(setName: string, key: any): void {
        super.remove(setName, key);

        setTimeout(() => {
            var table = this.getStoreTable(setName);

            if (table[key]) {
                delete table[key];
                this.setStoreTable(setName, table);
            }
        }, 1);
    }

    addRange(setName: string, items: any[]): void {
        var currentSet = this.context[setName];

        super.addRange(setName, items);

        setTimeout(() => {
            var table = this.getStoreTable(setName);
            
            _.each(items, (item) => {
                var key = this.getKey(setName, item);
                table[key] = currentSet.toJS(item, true);
            });
            
            this.setStoreTable(setName, table);
        }, 1);
    }
    updateRange(setName: string, items: any[]): void {
        var currentSet = this.context[setName];

        super.updateRange(setName, items);

        setTimeout(() => {
            var table = this.getStoreTable(setName);
            
            _.each(items, (item) => {
                var key = this.getKey(setName, item);
                table[key] = currentSet.toJS(item, true);
            });
            
            this.setStoreTable(setName, table);
        }, 1);
    }
    removeRange(setName: string, keys: any[]): void {
        super.removeRange(setName, keys);

        setTimeout(() => {
            var table = this.getStoreTable(setName);

            _.each(keys, (key) => {
                if (table[key])
                    delete table[key];
            });

            this.setStoreTable(setName, table);
        }, 1);
    }
}

export = LocalStorageStore;
