/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

import utils = require("../spa/utils");

export function run() {
    module("Utils Tests");

    test("utils.createAccessor", () => {
        expect(2);

        var value = 1,
            accessor = utils.createAccessor(value);

        ok(_.isFunction(accessor), "Created accessor must be a Function");
        equal(accessor(), value, "Accessor result must be equal to input value");
    });

    test("utils.createObservable", () => {
        expect(4);

        var value = 1,
            observable = ko.observable(1),
            result = utils.createObservable(value),
            result2 = utils.createObservable(observable);

        ok(ko.isSubscribable(result), "Created observable from simple value must be subscribable");
        ok(ko.isSubscribable(result2), "Created observable from other observable must be subscribable");

        equal(result(), value, "Result from observable created from simple value must be equal to input value");
        equal(result2, observable, "Created observable from other observable must be equal to input observable");
    });

    test("utils.createObservableArray", () => {
        expect(4);

        var value = [1, 2, 3],
            observable = ko.observableArray([1, 2, 3]),
            result = utils.createObservable(value),
            result2 = utils.createObservable(observable);

        ok(ko.isSubscribable(result), "Created observable from simple value must be subscribable");
        ok(ko.isSubscribable(result2), "Created observable from other observable must be subscribable");

        equal(result(), value, "Result from observable created from simple value must be equal to input value");
        equal(result2, observable, "Created observable from other observable must be equal to input observable");
    });

    test("utils.checkMethods", () => {
        expect(8);

        var a, b = 1,
            c = "1970-01-01T00:00:00", d = "dddd",
            e = " ", f = null, g = "", h = " test";

        equal(utils.isUndefined(a), true, "a is undefined");
        equal(utils.isUndefined(b), false, "a is not undefined");
        
        equal(utils.isDate(c), true, "c = '" + c + "' is a date");
        equal(utils.isDate(d), false, "d = '" + d + "' is not a date");
        
        equal(utils.isNullOrWhiteSpace(e), true, "e = '" + e + "' is null of whitespace");
        equal(utils.isNullOrWhiteSpace(f), true, "f = '" + f + "' is null of whitespace");
        equal(utils.isNullOrWhiteSpace(g), true, "g = '" + g + "' is null of whitespace");
        equal(utils.isNullOrWhiteSpace(h), false, "h = '" + h + "' is not null nor whitespace");
    });

    test("utils.extend", () => {
        expect(4);

        var obj1 = { prop1: "prop1" },
            obj2 = { prop2: "prop2" },
            result = utils.extend(obj1, obj2);

        ok(("prop1" in result), "The field prop1 must be in result object");
        ok(("prop2" in result), "The field prop2 must be in result object");

        equal(result.prop1, obj1.prop1, "The field prop1 from result object must be equals to field prop1 from entry object");
        equal(result.prop2, obj2.prop2, "The field prop2 from result object must be equals to field prop2 from entry object");
    });
    
    test("utils.inherits", () => {
        expect(10);

        var Type1 = function () {
            this.prop1 = "prop1";
        };
        Type1.prototype.do1 = function () {
            return "do1";
        };

        var Type2 = utils.inherits(function () {
            this.prop2 = "prop2";
        }, Type1, {
            do2: function () {
                return "do2";
            }
        });

        var obj1 = new Type1(),
            obj2 = new Type2();

        ok(("prop1" in obj2), "The field prop1 must be in inherited object");
        ok(("prop2" in obj2), "The field prop2 must be in inherited object");
        
        ok(("do1" in obj2), "The field do1 must be in inherited object");
        ok(("do2" in obj2), "The field do1 must be in inherited object");
        
        ok(_.isFunction(obj2.do1), "The field do1 must be a Function");
        ok(_.isFunction(obj2.do2), "The field do1 must be a Function");

        equal(obj2.prop1, "prop1", "The field prop1 from inherited object must be equals to 'prop1'");
        equal(obj2.prop2, "prop2", "The field prop2 from inherited object must be equals to 'prop2'");
        equal(obj2.do1(), "do1", "The Function do1 from inherited object must return 'do1'");
        equal(obj2.do2(), "do2", "The Function do2 from inherited object must return 'do2'");
    });

    test("utils.getWindowSize", () => {
        expect(4);

        var size = utils.getWindowSize();

        ok(_.isNumber(size.width), "The size's width must be a Number");
        ok(_.isNumber(size.height), "The size's height must be a Number");
        
        ok(size.width >= 0, "The size's width must be greater or equal of 0");
        ok(size.height >= 0, "The size's height must be greater or equal of 0");
    });

    asyncTest("utils.load", () => {
        expect(7);
        
        utils.load("../spa/base64").then(base64 => {
            ok(base64, "The base64 module must be loaded");
            
            ok(("encode" in base64), "The base64 module must contain the field 'encode'");
            ok(("decode" in base64), "The base64 module must contain the field 'decode'");
            ok(("createDataURL" in base64), "The base64 module must contain the field 'createDataURL'");

            
            ok(_.isFunction(base64.encode), "The base64 module's field 'encode' must be a Function");
            ok(_.isFunction(base64.decode), "The base64 module's field 'decode' must be a Function");
            ok(_.isFunction(base64.createDataURL), "The base64 module's field 'createDataURL' must be a Function");

            start();
        });
    });

    test("utils.format", () => {
        expect(1);

        var result = utils.format("{0} {1}", "Hello", "World");
        equal(result, "Hello World", "The format '{0} {1}' with arguments 'Hello' and 'World' must result in 'Hello World'");
    });

    test("utils.str_pad", () => {
        expect(4);

        var pad1 = utils.str_pad("1", 9, "0"),
            pad2 = utils.str_pad("1", 9, "0", true);

        equal(pad1.length, 9, "pad1 must be 9 characters length");
        equal(pad2.length, 9, "pad2 must be 9 characters length");

        ok((/^0{8}1$/).test(pad1), "pad1 must be 000000001");
        ok((/^10{8}$/).test(pad2), "pad1 must be 100000000");
    });
    
    test("utils.arrayCompare", () => {
        expect(4);

        var obj1 = { prop: "value" },
            obj2 = { prop: "eulav" },
            obj3 = { prop: "lueva" },
            obj4 = { prop: "eluav" };

        var array1 = [obj1, obj2, obj3],
            array2 = [obj1, obj2, obj4],
            result = utils.arrayCompare(array1, array2);

        equal(result.added.length, 1, "obj4 has been added in array2, so result.added.lenght must be '1'");
        equal(result.removed.length, 1, "obj3 has been removed in array2, so result.added.lenght must be '1'");

        equal(result.added[0], obj4, "result.added must contains obj4");
        equal(result.removed[0], obj3, "result.removed must contains obj3");
    });

    test("utils.arrayEquals", () => {
        expect(4);
        
        var obj1 = { prop: "value" },
            obj2 = { prop: "eulav" },
            obj3 = { prop: "lueva" },
            obj4 = { prop: "eluav" };

        var array1 = [obj1, obj2, obj3],
            array2 = [obj1, obj2, obj4],
            array3 = [obj1, obj2, obj3],
            array4 = [obj1, obj2, obj4];

        equal(utils.arrayEquals(array1, array2), false, "array1 and array2 are different");
        equal(utils.arrayEquals(array3, array4), false, "array3 and array4 are different");

        equal(utils.arrayEquals(array1, array3), true, "array1 and array3 are equal");
        equal(utils.arrayEquals(array2, array4), true, "array2 and array4 are equal");
    });
}