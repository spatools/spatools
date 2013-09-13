/// <reference path="_data.d.ts" />

import utils = require("../utils");
import context = require("./context");

var stores = {};

export interface IDataStore {
    context: context.DataContext;

    constructor(context: context.DataContext);

    init(force?: boolean): JQueryPromise<any>;

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

export function addStoreType(name: string, store: any): void {
    stores[name] = store;
}

export function getStore(name: string, context: context.DataContext): JQueryPromise<IDataStore> {
    var dfd: JQueryPromise<IDataStore> = (!stores[name]) ?
                utils.load("./data/stores/" + name).then(() => new stores[name](context)) : 
                $.when(new stores[name](context));

    return dfd.then(store => store.init(true).then(() => store));
}