/// <reference path="_data.d.ts" />

import mapping = require("./mapping");
import stores = require("./stores");
import adapters = require("./adapters");
import dataset = require("./dataset");

export class DataContext {
    private sets: {[key: string]: dataset.DataSet<any, any>} = {};

    public store: stores.IDataStore;
    public adapter: adapters.IAdapter = adapters.getDefaultAdapter();

    public buffer: boolean = false;
    public autoLazyLoading: boolean = false;
    public mapping = new mapping.Configurations();

    constructor() {
        this.store = stores.getDefaultStore(this);
    }

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
    /** Add a new Data Set to current Data Context */
    public addSet<T, TKey>(name: string, keyProperty: string, defaultType: string): dataset.DataSet<T, TKey> {
        if (!this.sets[name])
            this[name] = this.sets[name] = dataset.create<T, TKey>(name, keyProperty, defaultType, this);

        return this.sets[name];
    }

    public reset(): void {
        _.each(this.sets, dataset => { dataset.reset(); });
    }
    public resetStore(): JQueryPromise<void> {
        return this.store.reset();
    }

    /** change local store type */
    public setLocalStore(storeType: string): JQueryPromise<any>;
    public setLocalStore(storeType: stores.IDataStore): JQueryPromise<any>;
    public setLocalStore(storeType: any): JQueryPromise<any> {
        var dfd = _.isString(storeType) ? stores.getStore(storeType, this) : storeType.init().then(() => storeType);

        return $.when<stores.IDataStore>(dfd).then(store => {
            this.store = store;
            _.each(this.sets, dataset => dataset.setLocalStore(store));
        });
    }

    /** change remote adapter type */
    public setAdapter(adapterType: string): JQueryPromise<any>;
    public setAdapter(adapterType: adapters.IAdapter): JQueryPromise<any>;
    public setAdapter(adapterType: any): JQueryPromise<any> {
        var dfd = _.isString(adapterType) ? adapters.getAdapter(adapterType) : adapterType;

        return $.when<adapters.IAdapter>(dfd).then(adapter => {
            this.adapter = adapter;
            _.each(this.sets, set => set.setAdapter(adapter));
        });
    }
}

export function create(storeType: string = "memory", adapterType: string = "odata", buffer: boolean = false, autoLazyLoading: boolean = false): JQueryPromise<DataContext> {
    var context = new DataContext();

    context.buffer = buffer;
    context.autoLazyLoading = autoLazyLoading;

    return $.when(context.setLocalStore(storeType), context.setAdapter(adapterType)).then(() => context);
}
