/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

import messenger = require("../spa/messenger");

var topic = "__SPA_TEST_TOPIC__",
    expectedResult = "dGhpcyBpcyBhIHRlc3QgZm9yIHNwYSB0b29scyBiYXNlNjQgZW5jb2Rlcg==";

export function run() {
    module("Messenger Tests");

    test("messenger.publish", () => {
        expect(2);

        var callback = () => ok(1, "message sent on topic '__SPA_TEST_TOPIC__' has been received");

        messenger.subscribe(topic, callback);
        ok(messenger.publish(topic), "message has been published");

        messenger.unsubscribe(topic, callback);
    });

    test("messenger.subscribe", () => {
        expect(4);

        var order = 0;
        
        var callback1 = () => equal(order++, 0, "message sent on topic '__SPA_TEST_TOPIC__' has been received in first"),
            callback2 = () => equal(order++, 2, "message sent on topic '__SPA_TEST_TOPIC__' has been received in third") || false,
            callback3 = () => equal(order++, 1, "message sent on topic '__SPA_TEST_TOPIC__' has been received in second"),
            callback4 = () => equal(order++, 3, "message sent on topic '__SPA_TEST_TOPIC__' has been received in fourth");

        messenger.subscribe(topic, callback1, { priority: 1 });
        messenger.subscribe(topic, callback2, { priority: 3 });
        messenger.subscribe(topic, callback3, { priority: 2 });
        messenger.subscribe(topic, callback4, { priority: 4 });

        equal(messenger.publish(topic), false, "message has been published, but has been stopped");
        
        messenger.unsubscribe(topic, callback1);
        messenger.unsubscribe(topic, callback2);
        messenger.unsubscribe(topic, callback3);
        messenger.unsubscribe(topic, callback4);
    });

    test("messenger.subscribeNext", () => {
        expect(3);

        messenger.subscribeNext(topic, () => ok(1, "message sent on topic '__SPA_TEST_TOPIC__' has been received once"));

        ok(messenger.publish(topic), "message has been published once");
        ok(messenger.publish(topic), "message has been published twice (but not response)");
    });
}