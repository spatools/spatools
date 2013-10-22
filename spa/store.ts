/// <reference path="_definitions.d.ts" />

import utils = require("./utils");

export interface ISimpleStorage {
    length: number;

    init? (): JQueryPromise<void>;

    key(index: any): any;
    getItem(key: any): any;
    setItem(key: any, value: any): void;
    removeItem(key: any): void;
    clear(): void
}

var stores: any = {};
function createFromIStorage(type: string, storage: ISimpleStorage): void {
    stores[type] = storage;
}

//#region Create Available Stores

class MemoryStorage implements ISimpleStorage {
    private memory = {};
    private timeouts = {};
    public length: number = 0;

    clone = function (obj) {
        return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
    };

    key = function (index: any): any {
        return _.find(_.values(this.memory), (val, i: number) => i === index);
    };

    getItem = function (key: any): any {
        return this.clone(this.memory[key]);
    };
    setItem = function (key: any, value: any): void {
        this.memory[key] = value;
    };
    removeItem = function (key: any): void {
        delete this.memory[key];
    };

    clear = function (): void {
        this.memory = {};
        return null;
    };
}
createFromIStorage("memory", new MemoryStorage());

class WebSQLStorage implements ISimpleStorage {
    private memory = {};
    private db = null;

    public length: number = 0;
    public dbname = "spastore";
    public tablename = "storetable";
    public dbsize = 10 * 1024 * 1024;

    private transaction(db): JQueryPromise<any> {
        return $.Deferred(dfd => { db.transaction(dfd.resolve, dfd.reject); }).promise();
    } 
    private executeSql(db, req: string, values?: any[]): JQueryPromise<any> {
        return this.transaction(db).then(tx => $.Deferred(dfd => { tx.executeSql(req, values || [], (tx, result) => { dfd.resolve(result, tx); }, dfd.reject); }));
    }
    private ensureDb(): JQueryPromise<any> {
        if (!this.db) {
            var db = this.db = (<any>window).openDatabase(this.dbname, "1.0", "SPA Store Database", this.dbsize);
            return this.executeSql(db, "CREATE TABLE IF NOT EXISTS " + this.tablename + " (id unique, data)").then(() => db);
        }

        return $.when(this.db);
    }

    public init(): JQueryPromise<any> {
        return this.ensureDb().then(db => {
            return this.executeSql(db, "SELECT * FROM " + this.tablename).then(result => {
                var len = result.rows.length, i, item;
                for (i = 0; i < len; i++) {
                    item = result.rows.item(i);
                    this.memory[item.id] = item.data;
                }

                this.length = len;
            });
        });
    }
    public clear() {
        this.memory = {};
        this.length = 0;
        return this.ensureDb().then(db => this.executeSql(db, "DELETE FROM " + this.tablename + " WHERE 1=1"));
    }

    public key(index: number) {
        return _.find(_.values(this.memory), (val, i) => i === index) || null;
    }
    public getItem(key: string) {
        return this.memory[key] || null;
    }
    public setItem(key: string, value: any) {
        var toUpdate = !!this.memory[key];
        this.memory[key] = value;

        return this.ensureDb().then(db => {
            if (toUpdate)
                return this.executeSql(db, "UPDATE " + this.tablename + " SET data=? WHERE id=?", [value, key]);
            else {
                return this.executeSql(db, "INSERT INTO " + this.tablename + " (id, data) VALUES (?, ?)", [key, value]);
                this.length++;
            }
        });
    }
    public removeItem(key: string) {
        if (this.memory[key]) {
            delete this.memory[key];
            this.length--;

            return this.ensureDb().then(db => this.executeSql(db, "DELETE FROM " + this.tablename + " WHERE id=?", [key]));
        }
    }
}
createFromIStorage("websql", new WebSQLStorage());

_.each(["localStorage", "sessionStorage"], function (storageType: string): void {
    try {
        if (window[storageType] && window[storageType].getItem) {
            createFromIStorage(storageType, window[storageType]);
        }
    }
    catch (e) {
        return false;
    }
});

(function () {
    if (window.globalStorage) {
        try {
            createFromIStorage("globalStorage", window.globalStorage[window.location.hostname]);
        }
        catch (e) {
            return false;
        }
    }
})();

//#endregion

//#region Initialize best available storage

var _store: ISimpleStorage = stores.localStorage;

if (!_store) {
    _store = stores.sessionStorage;
    if (stores.globalStorage)
        _store = stores.globalStorage;
}

if (!_store)
    _store = stores.memory;

//#endregion

//#region Public Methods

export var length: number = 0;

export function key(index: any): any {
    var result = _store.key(index);
    length = _store.length;
    return result;
}
export function getItem(key: any): any {
    var result = _store.getItem(key);
    length = _store.length;
    return result;
}
export function setItem(key: any, data: any): void {
    _store.setItem(key, data);
    length = _store.length;
}
export function removeItem(key: any): void {
    _store.removeItem(key);
    length = _store.length;
}
export function clear(): void {
    _store.clear();
    length = _store.length;
}

export function changeStore(type: string): JQueryPromise<void> {
    if (stores[type]) {
        _store = stores[type];
        length = _store.length;

        return _store.init && _store.init()
    }

    return utils.wrapError("NOT FOUND");
}
export function addStorageType(type: string, store: ISimpleStorage, change: boolean): JQueryPromise<void> {
    if (stores[type]) {
        throw new Error("This store already exists !");
    }

    if (_.isNumber(store.length) && store.clear && store.getItem && store.setItem && store.key && store.removeItem) {
        createFromIStorage(type, store);
    }

    if (change === true) {
        return changeStore(type);
    }

    return $.when();
}

//#endregion
