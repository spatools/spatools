/// <reference path="../_data.d.ts" />

import stores = require("../stores");
import context = require("../context");

class MemoryStore implements stores.IDataStore {
    public memory = {};
    
    constructor(public context: context.DataContext) { }

    init(force?: boolean): JQueryPromise {
        return $.when();
    }

    /* return set key or item key if specified */
    getKey(setName: string, item: any): any {
        return item ? this.context[setName].getKey(item) : this.context[setName].key;
    }
    getMemorySet(setName: string): {} {
        if (!this.memory[setName])
            this.memory[setName] = {};

        return this.memory[setName];
    }

    getAll(setName: string): any[]{
        return _.values(this.getMemorySet(setName));
    }
    getOne(setName: string, key: any): any {
        var table = this.getMemorySet(setName);
        return table[key];
    }

    add(setName: string, item: any): void {
        var table = this.getMemorySet(setName),
            key = this.getKey(setName, item);

        table[key] = item;
    }
    /* Nothing because all observable but to override to update specific stores */
    update(setName: string, item: any): void { }
    remove(setName: string, key: any): void {
        var table = this.getMemorySet(setName);
        delete table[key];
    }

    addRange(setName: string, items: any[]): void {
        var table = this.getMemorySet(setName);

        _.each(items, function (item) {
            var key = this.getKey(setName, item);
            table[key] = item;
        }, this);
    }
    /* Nothing because all observable but to override to update specific stores */
    updateRange(setName: string, items: any[]): void { }
    removeRange(setName: string, keys: any[]): void {
        var table = this.getMemorySet(setName);
        _.each(keys, function (key) {
            delete table[key];
        }, this);
    }
}

stores.addStoreType("memory", MemoryStore);

export = MemoryStore;