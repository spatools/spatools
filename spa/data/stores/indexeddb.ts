/// <reference path="../_data.d.ts" />

import utils = require("../../utils");
import stores = require("../stores");
import context = require("../context");
import dataset = require("../dataset");
import mapping = require("../mapping");
import _query = require("../query");

var cachePrefix = "__SPA_DATA__";

class IndexedDBStore implements stores.IDataStore {
    private database: string = "__SPA_DATA__";
    private prefix: string = "";
    private version: number = 0;
    private db: IDBDatabase = null;
    private indexes: { [key: string]: string[] } = {};
    public context: context.DataContext;

    constructor(context: context.DataContext) {
        this.context = context;

        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    }

    //#region Public Methods

    init(): JQueryPromise<void> {
        return utils.timeout().then(() => {
            _.each(this.context.getSets(), dataset => {
                var conf = mapping.getMappingConfiguration(null, dataset),
                    ids = _.map(conf.relations, relation => relation.propertyName);

                this.indexes[dataset.setName] = ids;
            });
        });
    }
    reset(): JQueryPromise<void> {
        if (this.db)
            this.db.close();

        return $.Deferred(dfd => {
            var req = indexedDB.deleteDatabase(this.database);
            req.onsuccess = dfd.resolve;
            req.onerror = dfd.reject;
        });
    }

    getAll(setName: string, query?: _query.ODataQuery): JQueryPromise<any[]> {
        return this.getStoreTable(setName, query).then(result => {
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
        return this.getEntity(setName, key).then(entity => {
            if (entity && query) {
                if (query.selects.size() > 0) {
                    entity = this.applySelects(entity, query.selects());
                }

                if (query.expands.size() > 0) {
                    return this.applyExpands(setName, query.expands(), entity);
                }
            }

            return entity;
        });
    }

    add(setName: string, item: any): JQueryPromise<void> {
        return this.update(setName, item);
    }
    update(setName: string, item: any): JQueryPromise<void> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var key = this.getKey(setName, item),
                    storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readwrite").objectStore(storeName),
                    request = store.put(this.toJS(setName, item));

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            });
        });
    }
    remove(setName: string, key: any): JQueryPromise<void> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readwrite").objectStore(storeName),
                    request = store.delete(key);

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            });
        });
    }

    addRange(setName: string, items: any[]): JQueryPromise<void> {
        return this.updateRange(setName, items);
    }
    updateRange(setName: string, items: any[]): JQueryPromise<void> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    transaction = db.transaction(storeName, "readwrite"),
                    store = transaction.objectStore(storeName);

                transaction.onerror = dfd.reject;
                transaction.oncomplete = e => dfd.resolve(items);

                _.each(items, item => store.put(this.toJS(setName, item)));
            });
        });
    }
    removeRange(setName: string, keys: any[]): JQueryPromise<void> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    transaction = db.transaction(storeName, "readwrite"),
                    store = transaction.objectStore(storeName);

                transaction.onerror = dfd.reject;
                transaction.oncomplete = e => dfd.resolve(keys);

                _.each(keys, key => store.delete(key));
            });
        });
    }

    //#endregion

    //#region Database Methods

    private createUpgradeNeeded(deferred: JQueryDeferred<any>): (e: IDBVersionChangeEvent) => any {
        return (e: IDBVersionChangeEvent) => {
            var _db: IDBDatabase = e.target.result;

            // A versionchange transaction is started automatically.
            e.target.transaction.onerror = deferred.reject;

            _.each(this.context.getSets(), dataset => {
                var tableName = this.prefix + dataset.setName;
                if (!_db.objectStoreNames.contains(tableName)) {
                    var store = _db.createObjectStore(tableName, { keyPath: dataset.key });
                    _.each(this.indexes[dataset.setName], index => {
                        store.createIndex(index, index, { unique: false });
                    });
                }
            });
        };
    }
    private checkDatabaseVersion(): boolean {
        var dbVersion = parseInt(this.db.version, 10);
        if (dbVersion > this.version)
            this.version = dbVersion;

        return _.all(this.context.getSets(), function (set) {
            return this.db.objectStoreNames.contains(this.prefix + set.setName);
        }, this);
    }
    private checkDatabaseConnection(): JQueryPromise<IDBDatabase> {
        return $.Deferred((dfd) => {
            var request = this.version ? indexedDB.open(this.database, this.version) : indexedDB.open(this.database);

            request.onupgradeneeded = this.createUpgradeNeeded(dfd);
            request.onsuccess = (e) => {
                this.db = e.target.result;

                if (this.checkDatabaseVersion()) {
                    dfd.resolve(this.db);
                }
                else {
                    this.db.close();
                    this.upgradeDatabase()
                        .done(dfd.resolve)
                        .fail(dfd.reject);
                }
            };

            request.onerror = dfd.reject;
            request.onblocked = dfd.reject;
        }).promise();
    }
    private upgradeDatabase(): JQueryPromise<IDBDatabase> {
        return $.Deferred((dfd) => {
            var request = indexedDB.open(this.database, ++this.version);

            request.onupgradeneeded = this.createUpgradeNeeded(dfd);
            request.onsuccess = (e: Event) => {
                this.db = e.target.result;
                dfd.resolve(this.db);
            };

            request.onblocked = dfd.reject;
            request.onerror = dfd.reject;
        }).promise();
    }

    /** Ensure correct database is opened */
    private ensureDatabase(): JQueryPromise<IDBDatabase> {
        return $.when(this.db || this.checkDatabaseConnection());
    }

    //#endregion

    //#region Private Methods

    private getStoreTable(setName: string, query?: _query.ODataQuery): JQueryPromise<any[]> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var entities = [],
                    storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readonly").objectStore(storeName),
                    cursor;

                if (query && query.filters.size() > 0) {
                    var ids = this.indexes[setName],
                        filter: any = query.filters.find((f: any) => !_.isString(f) && _.contains(ids, f.field()) && f.operator() === _query.operator.equal);

                    if (filter) {
                        cursor = store.index(filter.field()).openCursor(new IDBKeyRange().only(filter.value()));
                    }
                }

                if (!cursor) {
                    cursor = store.openCursor();
                }

                cursor.onsuccess = function (e) {
                    var _cursor = e.target.result;
                    if (_cursor) {
                        entities.push(_cursor.value);
                        _cursor.continue();
                    }
                    else
                        dfd.resolve(entities);
                };

                cursor.onerror = dfd.reject;
            }).promise();
        });
    }
    private getEntity(setName: string, key: any): JQueryPromise<any> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    store = db.transaction(this.prefix + setName, "readonly").objectStore(storeName),
                    request = store.get(key);

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            }).promise();
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

export = IndexedDBStore;
