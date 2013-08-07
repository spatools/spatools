define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var priority = 1, subscriptions = {};

    /** Publish message with specified options in the given topic */
    function publish(topic) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        if (!subscriptions[topic]) {
            return true;
        }

        var _subscriptions = _.sortBy(subscriptions[topic], function (s) {
            return s.priority;
        }), result, index;
        _.find(_subscriptions, function (subscription) {
            result = subscription.callback.apply(subscription.context, args);
            return (result === false);
        });

        while (index !== -1) {
            index = _.index(subscriptions[topic], function (s) {
                return s.once;
            });
            if (index !== -1)
                subscriptions[topic].splice(index, 1);
        }

        return result !== false;
    }
    exports.publish = publish;

    /** Publish message with specified options in the given topic */
    function subscribe(topic, callback, options) {
        if (!topic || !callback)
            throw new Error("missing topic or callback argument");

        var topics = topic.split(/\s/), _options = ko.utils.extend({ priority: priority }, options);

        _.each(topics, function (t) {
            if (!subscriptions[topic])
                subscriptions[topic] = [];

            subscriptions[topic].push({
                callback: callback,
                context: _options.context,
                priority: _options.priority,
                once: _options.once
            });
        });
    }
    exports.subscribe = subscribe;

    /** Subscribe for the next iteration of the specified topic with given callback and options */
    function subscribeNext(topic, callback, options) {
        var _options = ko.utils.extend({ once: true }, options);
        exports.subscribe(topic, callback, _options);
    }
    exports.subscribeNext = subscribeNext;

    /** Publish message with specified options in the given topic */
    function unsubscribe(topic, callback) {
        if (!subscriptions[topic])
            return;

        var index = -1;
        _.find(subscriptions[topic], function (subscription, i) {
            index = i;
            return subscription.callback === callback;
        });

        if (index !== -1)
            subscriptions[topic].splice(index, 1);
    }
    exports.unsubscribe = unsubscribe;
    ;
});
