/// <reference path="_data.d.ts" />

import utils = require("../utils");
import context = require("./context");
import query = require("./query");
import MemoryStore = require("./stores/memory");

var stores: { [key: string]: IDataStoreConstructor } = {
    "memory": MemoryStore
};

export interface IDataStoreConstructor {
    new (context: context.DataContext): IDataStore;
}

export interface IDataStore {
    context: context.DataContext;

    init(): JQueryPromise<void>;
    reset(): JQueryPromise<void>;

    getAll(setName: string, query?: query.ODataQuery): JQueryPromise<any[]>;
    getOne(setName: string, key: any, query?: query.ODataQuery): JQueryPromise<any>;

    add(setName: string, item: any): JQueryPromise<void>;
    update(setName: string, item: any): JQueryPromise<void>;
    remove(setName: string, key: any): JQueryPromise<void>;

    addRange(setName: string, items: any[]): JQueryPromise<void>;
    updateRange(setName: string, items: any[]): JQueryPromise<void>;
    removeRange(setName: string, keys: any[]): JQueryPromise<void>;
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
