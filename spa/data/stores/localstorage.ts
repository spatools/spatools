/// <reference path="../_data.d.ts" />

import utils = require("../../utils");
import stores = require("../stores");
import context = require("../context");
import dataset = require("../dataset");
import mapping = require("../mapping");
import _query = require("../query");

var cachePrefix = "__SPA_DATA__";

class LocalStorageStore implements stores.IDataStore {
    public context: context.DataContext;

    constructor(context: context.DataContext) {
        this.context = context;
    }

    //#region Public Methods

    init(): JQueryPromise<void> {
        return $.when();
    }
    reset(): JQueryPromise<void> {
        var dfds = _.map(this.context.getSets(), dataset => {
            return utils.timeout().then(() => {
                localStorage.removeItem(cachePrefix + dataset.setName);
            });
        });

        return utils.whenAll(dfds);
    }

    getAll(setName: string, query?: _query.ODataQuery): JQueryPromise<any[]> {
        return this.getStoreTable(setName).then(table => {
            var result = _.values(table);
            
            if (query) {
                result = query.apply(result);

                if (query.selects.size() > 0) {
                    result = this.applySelectsRange(result, query.selects());
                }

                if (query.expands.size() > 0) {
                    return this.applyExpandsRange(setName, query.expands(), result);
                }
            }

            return result;
        });
    }
    getOne(setName: string, key: any, query?: _query.ODataQuery): JQueryPromise<any> {
        return this.getStoreTable(setName).then(table => {
            var item = table[key];

            if (item && query) {
                if (query.selects.size() > 0) {
                    item = this.applySelects(item, query.selects());
                }

                if (query.expands.size() > 0) {
                    return this.applyExpands(setName, query.expands(), item);
                }
            }

            return item;
        });
    }

    add(setName: string, item: any): JQueryPromise<void> {
        return this.update(setName, item);
    }
    update(setName: string, item: any): JQueryPromise<void> {
        return this.getStoreTable(setName).then(table => {
            var key = this.getKey(setName, item);
            table[key] = this.toJS(setName, item);
            return this.setStoreTable(setName, table);
        });
    }
    remove(setName: string, key: any): JQueryPromise<void> {
        return this.getStoreTable(setName).then(table => {
            if (table[key]) {
                delete table[key];
                return this.setStoreTable(setName, table);
            }
        });
    }

    addRange(setName: string, items: any[]): JQueryPromise<void> {
        return this.updateRange(setName, items);
    }
    updateRange(setName: string, items: any[]): JQueryPromise<void> {
        return this.getStoreTable(setName).then(table => {
            _.each(items, item => {
                var key = this.getKey(setName, item);
                table[key] = this.toJS(setName, item);
            });

            return this.setStoreTable(setName, table);
        });
    }
    removeRange(setName: string, keys: any[]): JQueryPromise<void> {
        return this.getStoreTable(setName).then(table => {
            _.each(keys, key => {
                if (table[key])
                    delete table[key];
            });

            return this.setStoreTable(setName, table);
        });
    }

    //#endregion

    //#region Private Methods

    private getStoreTable(setName: string): JQueryPromise<any> {
        return utils.timeout().then(() => {
            return JSON.parse(localStorage.getItem(cachePrefix + setName)) || {};
        });
    }
    private setStoreTable(setName: string, setValue: any): JQueryPromise<void> {
        return utils.timeout().then(() => {
            localStorage.setItem(cachePrefix + setName, JSON.stringify(setValue));
        });
    }

    /* return set key or item key if specified */
    private getKey(setName: string, item?: any): JQueryPromise<any> {
        var dataset = this.context.getSet(setName);
        return item ? dataset.getKey(item) : dataset.key;
    }
    private toJS(setName: string, entity: any): any {
        var dataset = this.context.getSet(setName);
        return dataset.toJS(entity, true);
    }

    private applySelects(item: any, selects: string[]): any {
        var args = [item, "$type", "odata.type", "EntityState"].concat(selects);
        return _.pick.apply(_, args);
    }
    private applySelectsRange(items: any[], selects: string[]): any {
        return _.map(items, item => this.applySelects(item, selects));
    }

    private applyExpands(setName: string, expands: string[], item: any, _set?: dataset.DataSet<any, any>): JQueryPromise<any> {
        var dataset = _set || this.context.getSet(setName),
            conf = mapping.getMappingConfiguration(item, dataset),

            dfds = _.filterMap(conf.relations, (relation: mapping.Relation) => {
                if (_.contains(expands, relation.propertyName)) {
                    return utils.timeout().then(() => {
                        var q = relation.toQuery(item, dataset, this.context.getSet(relation.controllerName));

                        return this.getAll(relation.controllerName, q).then(entities => {
                            item[relation.propertyName] = entities;
                        });
                    });
                }
            });

        return utils.whenAll(dfds).then(() => item);
    }
    private applyExpandsRange(setName: string, expands: string[], result: any[]): JQueryPromise<any[]> {
        var dataset = this.context.getSet(setName),
            dfds = _.map(result, item => this.applyExpands(setName, expands, item, dataset));

        return utils.whenAll(dfds).then(() => result);
    }

    //#endregion
}

export = LocalStorageStore;
