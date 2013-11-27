/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

import store = require("../spa/store");

var storeKey = "__SPA_STORE_TEST__",
    simpleValue = "This is a simple value to store",
    complexValue = {
        title: "Title",
        value: "Value"
    };

export function run() {
    module("Store Tests");

    test("store.simple", () => {
        expect(4);

        store.clear();
        equal(store.length, 0, "Store has been cleared, so store.length must be '0'");

        store.setItem(storeKey, simpleValue);
        equal(store.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");
        
        var val = store.getItem(storeKey);
        equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

        store.removeItem(storeKey);
        equal(store.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'");
    });

    test("store.complex", () => {
        expect(6);
        
        store.clear();
        equal(store.length, 0, "Store has been cleared, so store.length must be '0'");

        var serialized = JSON.stringify(complexValue);

        store.setItem(storeKey, serialized);
        equal(store.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

        var val = store.getItem(storeKey);
        equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

        var real = JSON.parse(val);
        equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
        equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

        store.removeItem(storeKey);
        equal(store.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'");
    });

    if (Modernizr.websqldatabase) {
        asyncTest("store.websql.simple", () => {
            expect(4);

            var websql = new store.WebSQLStorage();
            websql.dbsize = 1024;

            websql
                .init()
                .then(() => websql.clear())
                .then(() => { equal(websql.length, 0, "Store has been cleared, so store.length must be '0'"); })
                .then(() => websql.setItem(storeKey, simpleValue))
                .then(() => {
                    equal(websql.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");

                    var val = websql.getItem(storeKey);
                    equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

                    return websql.removeItem(storeKey);
                })
                .then(() => { equal(websql.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
                .always(start);
        });

        asyncTest("store.websql.complex", () => {
            expect(6);

            var websql = new store.WebSQLStorage();
            var serialized = JSON.stringify(complexValue);
            websql.dbsize = 1024;

            websql
                .init()
                .then(() => websql.clear())
                .then(() => { equal(websql.length, 0, "Store has been cleared, so store.length must be '0'"); })
                .then(() => websql.setItem(storeKey, serialized))
                .then(() => {
                    equal(websql.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

                    var val = websql.getItem(storeKey);
                    equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

                    var real = JSON.parse(val);
                    equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
                    equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

                    return websql.removeItem(storeKey);
                })
                .then(() => { equal(websql.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
                .always(start);
        });
    }

    if (Modernizr.indexeddb) {
        asyncTest("store.idb.simple", () => {
            expect(4);

            var idb = new store.IndexedDBStorage();

            idb.init()
                .then(() => idb.clear())
                .then(() => { equal(idb.length, 0, "Store has been cleared, so store.length must be '0'"); })
                .then(() => idb.setItem(storeKey, simpleValue))
                .then(() => {
                    equal(idb.length, 1, "The value '" + simpleValue + "' has been added on key '" + storeKey + "', so store.length must be '1'");

                    var val = idb.getItem(storeKey);
                    equal(val, simpleValue, "The value on key '" + storeKey + "' must be '" + simpleValue + "'");

                    return idb.removeItem(storeKey);
                })
                .then(() => { equal(idb.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
                .always(start);
        });


        asyncTest("store.idb.complex", () => {
            expect(6);

            var idb = new store.IndexedDBStorage();
            var serialized = JSON.stringify(complexValue);

            idb.init()
                .then(() => idb.clear())
                .then(() => { equal(idb.length, 0, "Store has been cleared, so store.length must be '0'"); })
                .then(() => idb.setItem(storeKey, serialized))
                .then(() => {
                    equal(idb.length, 1, "The value '" + serialized + "' has been added on key '" + storeKey + "', so store.length must be '1'");

                    var val = idb.getItem(storeKey);
                    equal(val, serialized, "The value on key '" + storeKey + "' must be '" + serialized + "'");

                    var real = JSON.parse(val);
                    equal(real.title, complexValue.title, "After serialization value.title must be '" + complexValue.title + "'");
                    equal(real.value, complexValue.value, "After serialization value.value must be '" + complexValue.value + "'");

                    return idb.removeItem(storeKey);
                })
                .then(() => { equal(idb.length, 0, "The value on key '" + storeKey + "' has been deleted, so store.length must be '0'"); })
                .always(start);
        });
    }
}