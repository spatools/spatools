/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

import utils = require("../spa/utils");

export function run() {
    module("Base Tests");

    asyncTest("base.extenders.delay", () => {
        expect(6);

        var notified = false,
            result = ko.observable(10).extend({ delay: 10 });

        result.subscribe(() => notified = true);

        equal(result(), 10, "Observable initial value must be equals to '10'");
        
        result.immediate(100);
        equal(notified, false, "Observable value changed to '100' but change is delayed so no notification");
        equal(result(), 10, "Observable value changed to '100' but change is delayed so no change visible");
        equal(result.immediate(), 100, "Observable immediate value must be equals to new value '100'");

        setTimeout(() => {
            equal(notified, true, "After delay, notification must be propagated");
            equal(result(), 100, "After delay, observable value must be '100'");

            start();
        }, 20);
    });

    test("base.extenders.notify.reference", () => {
        expect(4);

        var notified = false,
            value = { prop: "value" },
            newValue = { prop: "newValue" },
            result = ko.observable(value).extend({ notify: "reference" });

        result.subscribe(() => notified = true);

        equal(result(), value, "Observable initial value must be equals to variable 'value'");

        result(value);
        equal(notified, false, "Observable value tried to be changed, but value are === so not notified");

        result(newValue);
        equal(result(), newValue, "Observable value has been changed to 'newValue' so must be equal");
        equal(notified, true, "Observable value has been changed to 'newValue', so notified");
    });

    test("base.extenders.notify.custom", () => {
        expect(4);

        var notified = false,
            value = [{ prop: "value" }, { prop: "lueva" }, { prop: "eulav" }],
            clone = _.clone(value),
            newValue = [{ prop: "newValue" }, { prop: "luevanew" }, { prop: "eulavwen" }],
            result = ko.observable(value).extend({ notify: utils.arrayEquals });

        result.subscribe(() => notified = true);

        equal(result(), value, "Observable initial value must be equals to variable 'value'");

        result(clone);
        equal(notified, false, "Observable value tried to be changed, but value are === so not notified");

        result(newValue);
        equal(result(), newValue, "Observable value has been changed to 'newValue' so must be equal");
        equal(notified, true, "Observable value has been changed to 'newValue', so notified");
    });
    
    test("base.extenders.cnotify.reference", () => {
        expect(4);

        var notified = false,
            value = { prop: "value" },
            newValue = { prop: "newValue" },
            obsv = ko.observable(value),
            result = ko.computed(obsv).extend({ cnotify: "reference" });

        result.subscribe(() => notified = true);

        equal(result(), value, "Computed initial value must be equals to variable 'value'");

        obsv(value);
        equal(notified, false, "Computed value tried to be changed, but value are === so not notified");

        obsv(newValue);
        equal(result(), newValue, "Computed value has been changed to 'newValue' so must be equal");
        equal(notified, true, "Computed value has been changed to 'newValue', so notified");
    });

    test("base.extenders.cnotify.custom", () => {
        expect(4);

        var notified = false,
            value = [{ prop: "value" }, { prop: "lueva" }, { prop: "eulav" }],
            clone = _.clone(value),
            newValue = [{ prop: "newValue" }, { prop: "luevanew" }, { prop: "eulavwen" }],
            obsv = ko.observable(value),
            result = ko.computed(obsv).extend({ cnotify: utils.arrayEquals });

        result.subscribe(() => notified = true);

        equal(result(), value, "Computed initial value must be equals to variable 'value'");

        obsv(clone);
        equal(notified, false, "Computed value tried to be changed, but value are === so not notified");

        obsv(newValue);
        equal(result(), newValue, "Computed value has been changed to 'newValue' so must be equal");
        equal(notified, true, "Computed value has been changed to 'newValue', so notified");
    });
}