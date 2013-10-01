/// <reference path="_data.d.ts" />

import utils = require("../utils");
import context = require("./context");

var stores: { [key: string]: IDataStoreConstructor } = {};

export interface IDataStoreConstructor {
    new (context: context.DataContext): IDataStore;
}

export interface IDataStore {
    context: context.DataContext;

    init(): JQueryPromise<any>;

    getKey(setName: string, item: any): any;
    getMemorySet(setName: string): {};
    getAll(setName: string): any[];
    getOne(setName: string, key: any): any;

    add(setName: string, item: any): void;
    update(setName: string, item: any): void;
    remove(setName: string, key: any): void;

    addRange(setName: string, items: any[]): void;
    updateRange(setName: string, items: any[]): void;
    removeRange(setName: string, keys: any[]): void;
}

export class MemoryStore implements IDataStore {
    public memory = {};
    public context: context.DataContext;

    constructor(context: context.DataContext) {
        this.context = context;
    }

    init(): JQueryPromise<any> {
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

    getAll(setName: string): any[] {
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
    update(setName: string, item: any): void { return null; }
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
    updateRange(setName: string, items: any[]): void { return null; }
    removeRange(setName: string, keys: any[]): void {
        var table = this.getMemorySet(setName);
        _.each(keys, function (key) {
            delete table[key];
        }, this);
    }
}

stores["memory"] = MemoryStore;

export function addStoreType(name: string, store: IDataStoreConstructor): void {
    stores[name] = store;
}

export function getDefaultStore(context: context.DataContext): IDataStore {
    return new MemoryStore(context);
}

export function getStore(name: string, context: context.DataContext): JQueryPromise<IDataStore> {
    return $.when(stores[name] || utils.load("./data/stores/" + name).done(s => stores[name] = s)).then(store => {
        var _store = new store(context);
        return _store.init().then(() => _store);
    });
}
