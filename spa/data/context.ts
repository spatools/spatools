/// <reference path="_data.d.ts" />

import mapping = require("./mapping");
import stores = require("./stores");
import adapters = require("./adapters");
import dataset = require("./dataset");

export class DataContext {
    private sets: {[key: string]: dataset.DataSet<any, any>} = {};

    public store: stores.IDataStore;
    public adapter: adapters.IAdapter;

    public buffer: boolean = false;
    public autoLazyLoading: boolean = false;
    public mapping = new mapping.Configurations();


    /** Get Mapping Configuration for specified type */
    public getMappingConfiguration(type: string): mapping.Configuration {
        return this.mapping.getConfiguration(type);
    }
    /** Add a mapping configuration to this data context */
    public addMappingConfiguration(config: mapping.Configuration): DataContext {
        this.mapping.addConfiguration(config);
        return this;
    }

    /** Get all sets defined in current context */
    public getSets(): dataset.DataSet<any, any>[]{
        return _.toArray(this.sets);
    }
    /** Get set from name */
    public getSet<T, TKey>(name: string): dataset.DataSet<T, TKey> {
        return this.sets[name];
    }
    /** Add a new Data Set to the Data Context */
    public addSet<T, TKey>(name: string, keyProperty: string, defaultType: string): dataset.DataSet<T, TKey> {
        if (!this.sets[name])
            this[name] = this.sets[name] = dataset.create<T, TKey>(name, keyProperty, defaultType, this);

        return this.sets[name];
    }
    
    /** Initialize context with default store and adapter */
    public initDefault(): JQueryPromise<any> {
        return $.when(
            this.setLocalStore("memory"),
            this.setAdapter("odata")
        );
    }

    /** change local store type */
    public setLocalStore(storeType: string): JQueryPromise<any> {
        return stores.getStore(storeType, this).then(store => this.store = store);
    }
    /** change remote adapter type */
    public setAdapter(adapterType: string): JQueryPromise<any> {
        return adapters.getAdapter(adapterType).then(adapter => this.adapter = adapter);
    }
}

export function create(storeType: string = "memory", adapterType: string = "odata", buffer: boolean = false, autoLazyLoading: boolean = false): JQueryPromise<DataContext> {
    var context = new DataContext();

    context.buffer = buffer;
    context.autoLazyLoading = autoLazyLoading;

    return $.when(context.setLocalStore(storeType), context.setAdapter(adapterType)).then(() => context);
}
