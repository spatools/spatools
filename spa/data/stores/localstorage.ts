/// <reference path="../_data.d.ts" />

import utils = require("../../utils");
import stores = require("../stores");
import MemoryStore = require("./memory");
import dataset = require("../dataset");

var cachePrefix = "__SPA_DATA__";

class LocalStorageStore extends MemoryStore {
    private initSet(set: dataset.DataSet<any, any>): void {
        var table = this.getStoreTable(set.setName);
        _.each(table, (value, key) => table[key] = set.fromJS(value));
        this.memory[set.setName] = table;
    }
    
    private getStoreTable(setName: string): {} {
        return JSON.parse(localStorage.getItem(cachePrefix + setName)) || {};
    }
    private setStoreTable(setName: string, setValue: {}): void {
        localStorage.setItem(cachePrefix + setName, JSON.stringify(setValue));
    }

    init(): JQueryPromise<any> {
        return utils.timeout().then(() => {
            var dfds = _.map(this.context.getSets(), set => utils.timeout().then(() => this.initSet(set)));
            return utils.whenAll(dfds);
        });
    }

    add(setName: string, item: any): JQueryPromise<void> {
        var key = this.getKey(setName, item),
            currentSet = this.context[setName];

        super.add(setName, item);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName);
            table[key] = currentSet.toJS(item, true);
            this.setStoreTable(setName, table);
        });
    }
    update(setName: string, item: any): JQueryPromise<void> {
        var currentSet = this.context[setName];

        super.update(setName, item);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName),
                key = this.getKey(setName, item);

            table[key] = currentSet.toJS(item, true);
            this.setStoreTable(setName, table);
        });
    }
    remove(setName: string, key: any): JQueryPromise<void> {
        super.remove(setName, key);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName);

            if (table[key]) {
                delete table[key];
                this.setStoreTable(setName, table);
            }
        });
    }

    addRange(setName: string, items: any[]): JQueryPromise<void> {
        var currentSet = this.context[setName];

        super.addRange(setName, items);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName);
            
            _.each(items, (item) => {
                var key = this.getKey(setName, item);
                table[key] = currentSet.toJS(item, true);
            });
            
            this.setStoreTable(setName, table);
        });
    }
    updateRange(setName: string, items: any[]): JQueryPromise<void> {
        var currentSet = this.context[setName];

        super.updateRange(setName, items);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName);
            
            _.each(items, (item) => {
                var key = this.getKey(setName, item);
                table[key] = currentSet.toJS(item, true);
            });
            
            this.setStoreTable(setName, table);
        });
    }
    removeRange(setName: string, keys: any[]): JQueryPromise<void> {
        super.removeRange(setName, keys);

        return utils.timeout().then(() => {
            var table = this.getStoreTable(setName);

            _.each(keys, (key) => {
                if (table[key])
                    delete table[key];
            });

            this.setStoreTable(setName, table);
        });
    }
}

export = LocalStorageStore;
