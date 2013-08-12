/// <reference path="../_data.d.ts" />

import stores = require("../stores");
import memory = require("./memory");

var cachePrefix = "__SPA_DATA__";

class IndexedDBStore extends memory {
    private database: string = "__SPA_DATA__";
    private prefix: string = "";
    private version: number = 0;
    private db: IDBDatabase = null;

    private initSet(set) {
        var name = set.setName;
        return this.getStoreTable(name).then(table => {
            for (var key in table) {
                table[key] = set.fromJS(table[key], table[key].EntityState);
            }

            this.memory[name] = table;
        });
    }

    private createUpgradeNeeded(deferred: JQueryDeferred<any>): (e: IDBVersionChangeEvent) => any {
        return (e: IDBVersionChangeEvent) => {
            var _db: IDBDatabase = e.target.result;

            // A versionchange transaction is started automatically.
            e.target.transaction.onerror = deferred.reject;

            _.each(this.context.getSets(), function (set) {
                var tableName = this.prefix + set.setName;
                if (!_db.objectStoreNames.contains(tableName))
                    _db.createObjectStore(tableName, { keyPath: set.key });
            }, this);
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

    private getStoreTable(setName: string): JQueryPromise<{}> {
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var entities = {},
                    storeName = this.prefix + setName,
                    cursor = db.transaction(storeName, "readonly").objectStore(storeName).openCursor();

                cursor.onsuccess = function (e) {
                    var _cursor = e.target.result;
                    if (_cursor) {
                        entities[_cursor.key] = _cursor.value;
                        _cursor.continue();
                    }
                    else
                        dfd.resolve(entities);
                };

                cursor.onerror = dfd.reject;
            }).promise();
        });
    }

    init(force?: boolean): JQueryPromise<any> {
        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

        if (force) {
            return this.ensureDatabase().then(() => {
                var deferreds = _.map(this.context.getSets(), this.initSet, this);
                return $.when.apply($, deferreds);
            });
        }
    }

    add(setName: string, item: any): JQueryPromise<any> {
        var key = this.getKey(setName, item),
            currentSet = this.context[setName];

        super.add(setName, item);

        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readwrite").objectStore(storeName),
                    request = store.add(currentSet.toJS(item, true));

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            });
        });
    }
    update(setName: string, item: any): JQueryPromise<any> {
        var currentSet = this.context[setName];

        super.update(setName, item);

        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var key = this.getKey(setName, item),
                    storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readwrite").objectStore(storeName),
                    request = store.put(currentSet.toJS(item, true));

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            });
        });
    }
    remove(setName: string, key: any): JQueryPromise<any> {
        super.remove(setName, key);
        
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var key = this.getKey(setName, item),
                    storeName = this.prefix + setName,
                    store = db.transaction(storeName, "readwrite").objectStore(storeName),
                    request = store.delete(key);

                request.onerror = dfd.reject;
                request.onsuccess = e => dfd.resolve(e.target.result);
            });
        });
    }

    addRange(setName: string, items: any[]): JQueryPromise<any> {
        var currentSet = this.context[setName];

        super.addRange(setName, items);
        
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    transaction = db.transaction(storeName, "readwrite"),
                    store = transaction.objectStore(storeName);
                
                transaction.onerror = dfd.reject;
                transaction.oncomplete = e => dfd.resolve(items);

                _.each(items, item => store.add(currentSet.toJS(item, true)));
            });
        });
    }
    updateRange(setName: string, items: any[]): JQueryPromise<any> {
        var currentSet = this.context[setName];

        super.updateRange(setName, items);
        
        return this.ensureDatabase().then(db => {
            return $.Deferred(dfd => {
                var storeName = this.prefix + setName,
                    transaction = db.transaction(storeName, "readwrite"),
                    store = transaction.objectStore(storeName);

                transaction.onerror = dfd.reject;
                transaction.oncomplete = e => dfd.resolve(items);

                _.each(items, item => store.put(currentSet.toJS(item, true)));
            });
        });
    }
    removeRange(setName: string, keys: any[]): JQueryPromise<any> {
        super.removeRange(setName, keys);
        
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
}

export = IndexedDBStore;