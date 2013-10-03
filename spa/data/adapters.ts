/// <reference path="_data.d.ts" />

import utils = require("../utils");
import query = require("./query");
import ODataAdapter = require("./adapters/odata");

export interface IAdapaterConstructor {
    new (): IAdapter;
}

export interface IAdapter {
    getAll(controller: string, query?: query.ODataQuery): JQueryPromise<IAdapterResult>;
    getOne(controler: string, id: any, query?: query.ODataQuery): JQueryPromise<any>;
    getRelation? (controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<IAdapterResult>;

    post(controller: string, data: any): JQueryPromise<any>;
    put(controller: string, id: any, data: any): JQueryPromise<any>;
    remove(controller: string, id: any): JQueryPromise<any>;

    action? (controller: string, action: string, parameters: any, id?: any): JQueryPromise<any>;
}

export interface IAdapterResult {
    data: any[];
    count: number;
}

var adapters: { [key: string]: IAdapaterConstructor } = {
    odata: ODataAdapter
};

export function getDefaultAdapter(): IAdapter {
    return new ODataAdapter();
}

export function getAdapter(name: string): JQueryPromise<IAdapter> {
    return $.when(adapters[name] || utils.load("./data/adapters/" + name)
            .done(a => adapters[name] = a))
            .then(adapter => new adapter());
}
