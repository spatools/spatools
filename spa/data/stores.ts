/// <reference path="_data.d.ts" />

import utils = require("../utils");
import context = require("./context");
import MemoryStore = require("./stores/memory");

var stores: { [key: string]: IDataStoreConstructor } = {};
stores.memory = MemoryStore;

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

export function getDefaultStore(context: context.DataContext): IDataStore {
    return new MemoryStore(context);
}

export function getStore(name: string, context: context.DataContext): JQueryPromise<IDataStore> {
    return $.when(stores[name] || utils.load("./data/stores/" + name).done(s => stores[name] = s)).then(store => {
        var _store = new store(context);
        return _store.init().then(() => _store);
    });
}
