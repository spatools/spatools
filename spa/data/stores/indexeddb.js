var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./memory"], function(require, exports, __memory__) {
    
    var memory = __memory__;

    var cachePrefix = "__SPA_DATA__";

    var IndexedDBStore = (function (_super) {
        __extends(IndexedDBStore, _super);
        function IndexedDBStore() {
            _super.apply(this, arguments);
            this.database = "__SPA_DATA__";
            this.prefix = "";
            this.version = 0;
            this.db = null;
        }
        IndexedDBStore.prototype.initSet = function (set) {
            var _this = this;
            var name = set.setName;
            return this.getStoreTable(name).then(function (table) {
                for (var key in table) {
                    table[key] = set.fromJS(table[key], table[key].EntityState);
                }

                _this.memory[name] = table;
            });
        };

        IndexedDBStore.prototype.createUpgradeNeeded = function (deferred) {
            var _this = this;
            return function (e) {
                var _db = e.target.result;

                // A versionchange transaction is started automatically.
                e.target.transaction.onerror = deferred.reject;

                _.each(_this.context.getSets(), function (set) {
                    var tableName = this.prefix + set.setName;
                    if (!_db.objectStoreNames.contains(tableName))
                        _db.createObjectStore(tableName, { keyPath: set.key });
                }, _this);
            };
        };
        IndexedDBStore.prototype.checkDatabaseVersion = function () {
            var dbVersion = parseInt(this.db.version, 10);
            if (dbVersion > this.version)
                this.version = dbVersion;

            return _.all(this.context.getSets(), function (set) {
                return this.db.objectStoreNames.contains(this.prefix + set.setName);
            }, this);
        };
        IndexedDBStore.prototype.checkDatabaseConnection = function () {
            var _this = this;
            return $.Deferred(function (dfd) {
                var request = _this.version ? indexedDB.open(_this.database, _this.version) : indexedDB.open(_this.database);

                request.onupgradeneeded = _this.createUpgradeNeeded(dfd);
                request.onsuccess = function (e) {
                    _this.db = e.target.result;

                    if (_this.checkDatabaseVersion()) {
                        dfd.resolve(_this.db);
                    } else {
                        _this.db.close();
                        _this.upgradeDatabase().done(dfd.resolve).fail(dfd.reject);
                    }
                };

                request.onerror = dfd.reject;
                request.onblocked = dfd.reject;
            }).promise();
        };
        IndexedDBStore.prototype.upgradeDatabase = function () {
            var _this = this;
            return $.Deferred(function (dfd) {
                var request = indexedDB.open(_this.database, ++_this.version);

                request.onupgradeneeded = _this.createUpgradeNeeded(dfd);
                request.onsuccess = function (e) {
                    _this.db = e.target.result;
                    dfd.resolve(_this.db);
                };

                request.onblocked = dfd.reject;
                request.onerror = dfd.reject;
            }).promise();
        };

        /** Ensure correct database is opened */
        IndexedDBStore.prototype.ensureDatabase = function () {
            return $.when(this.db || this.checkDatabaseConnection());
        };

        IndexedDBStore.prototype.getStoreTable = function (setName) {
            var _this = this;
            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var entities = {}, storeName = _this.prefix + setName, cursor = db.transaction(storeName, "readonly").objectStore(storeName).openCursor();

                    cursor.onsuccess = function (e) {
                        var _cursor = e.target.result;
                        if (_cursor) {
                            entities[_cursor.key] = _cursor.value;
                            _cursor.continue();
                        } else
                            dfd.resolve(entities);
                    };

                    cursor.onerror = dfd.reject;
                }).promise();
            });
        };

        IndexedDBStore.prototype.init = function (force) {
            var _this = this;
            window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

            if (force) {
                return this.ensureDatabase().then(function () {
                    var deferreds = _.map(_this.context.getSets(), _this.initSet, _this);
                    return $.when.apply($, deferreds);
                });
            }
        };

        IndexedDBStore.prototype.add = function (setName, item) {
            var _this = this;
            var key = this.getKey(setName, item), currentSet = this.context[setName];

            _super.prototype.add.call(this, setName, item);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var storeName = _this.prefix + setName, store = db.transaction(storeName, "readwrite").objectStore(storeName), request = store.add(currentSet.toJS(item, true));

                    request.onerror = dfd.reject;
                    request.onsuccess = function (e) {
                        return dfd.resolve(e.target.result);
                    };
                });
            });
        };
        IndexedDBStore.prototype.update = function (setName, item) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.update.call(this, setName, item);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var key = _this.getKey(setName, item), storeName = _this.prefix + setName, store = db.transaction(storeName, "readwrite").objectStore(storeName), request = store.put(currentSet.toJS(item, true));

                    request.onerror = dfd.reject;
                    request.onsuccess = function (e) {
                        return dfd.resolve(e.target.result);
                    };
                });
            });
        };
        IndexedDBStore.prototype.remove = function (setName, key) {
            var _this = this;
            _super.prototype.remove.call(this, setName, key);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var key = _this.getKey(setName, item), storeName = _this.prefix + setName, store = db.transaction(storeName, "readwrite").objectStore(storeName), request = store.delete(key);

                    request.onerror = dfd.reject;
                    request.onsuccess = function (e) {
                        return dfd.resolve(e.target.result);
                    };
                });
            });
        };

        IndexedDBStore.prototype.addRange = function (setName, items) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.addRange.call(this, setName, items);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var storeName = _this.prefix + setName, transaction = db.transaction(storeName, "readwrite"), store = transaction.objectStore(storeName);

                    transaction.onerror = dfd.reject;
                    transaction.oncomplete = function (e) {
                        return dfd.resolve(items);
                    };

                    _.each(items, function (item) {
                        return store.add(currentSet.toJS(item, true));
                    });
                });
            });
        };
        IndexedDBStore.prototype.updateRange = function (setName, items) {
            var _this = this;
            var currentSet = this.context[setName];

            _super.prototype.updateRange.call(this, setName, items);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var storeName = _this.prefix + setName, transaction = db.transaction(storeName, "readwrite"), store = transaction.objectStore(storeName);

                    transaction.onerror = dfd.reject;
                    transaction.oncomplete = function (e) {
                        return dfd.resolve(items);
                    };

                    _.each(items, function (item) {
                        return store.put(currentSet.toJS(item, true));
                    });
                });
            });
        };
        IndexedDBStore.prototype.removeRange = function (setName, keys) {
            var _this = this;
            _super.prototype.removeRange.call(this, setName, keys);

            return this.ensureDatabase().then(function (db) {
                return $.Deferred(function (dfd) {
                    var storeName = _this.prefix + setName, transaction = db.transaction(storeName, "readwrite"), store = transaction.objectStore(storeName);

                    transaction.onerror = dfd.reject;
                    transaction.oncomplete = function (e) {
                        return dfd.resolve(keys);
                    };

                    _.each(keys, function (key) {
                        return store.delete(key);
                    });
                });
            });
        };
        return IndexedDBStore;
    })(memory);

    
    return IndexedDBStore;
});
