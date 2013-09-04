/// <reference path="_definitions.d.ts" />

export interface ISimpleStorage {
    length: number;

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
        return _.find(_.values(this.memory), (val, i?: number) => i === index);
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


_.each(["localStorage", "sessionStorage"], function (storageType: string): void {
    try {
        if (window[storageType] && window[storageType].getItem) {
            createFromIStorage(storageType, window[storageType]);
        }
    }
    catch (e) { }
});

if (window.globalStorage) {
    try {
        createFromIStorage("globalStorage", window.globalStorage[window.location.hostname]);
    }
    catch (e) {
    }
}

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

export function changeStore(type: string): void {
    if (stores[type]) {
        _store = stores[type];
        length = _store.length;
    }
}
export function addStorageType(type: string, store: ISimpleStorage, change: boolean) {
    if (stores[type])
        throw "This store already exists !";

    if (_.isNumber(store.length) && store.clear && store.getItem && store.setItem && store.key && store.removeItem) {
        createFromIStorage(type, store);
    }

    if (change === true) {
        changeStore(type);
    }
}

//#endregion