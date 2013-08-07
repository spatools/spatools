ko.extenders.delay = function (target, delay) {
    var value = target();

    target.timer = null;
    target.immediate = ko.observable(value);

    target.subscribe(target.immediate);
    target.immediate.subscribe(function (newValue) {
        if (newValue !== target()) {
            if (target.timer) {
                clearTimeout(target.timer);
            }

            target.timer = setTimeout(function () {
                return target(newValue);
            }, delay);
        }
    });

    return target;
};

ko.extenders.cnotify = function (target, notifyWhen) {
    var latestValue = null, superNotify = _.bind(ko.subscribable.fn.notifySubscribers, target), notify = function (value) {
        superNotify(latestValue, "beforeChange");
        superNotify(value);
    };

    target.notifySubscribers = function (value, event) {
        if (_.isFunction(notifyWhen)) {
            if (event === "beforeChange") {
                latestValue = target.peek();
            } else if (!notifyWhen(latestValue, value)) {
                notify(value);
            }
            return;
        }

        switch (notifyWhen) {
            case "primitive":
                if (event === "beforeChange") {
                    latestValue = target.peek();
                } else if (!ko.observable.fn.equalityComparer(latestValue, value)) {
                    notify(value);
                }
                break;
            case "reference":
                if (event === "beforeChange") {
                    latestValue = target.peek();
                } else if (latestValue !== value) {
                    notify(value);
                }
                break;
            default:
                //case "auto":
                //case "always":
                superNotify.apply(null, arguments);
                break;
        }
    };

    return target;
};

ko.extenders.notify = function (target, notifyWhen) {
    if (_.isFunction(notifyWhen)) {
        target.equalityComparer = notifyWhen;
        return target;
    }
    switch (notifyWhen) {
        case "always":
            target.equalityComparer = function () {
                return false;
            };
            break;
        case "manual":
            target.equalityComparer = function () {
                return true;
            };
            break;
        case "reference":
            target.equalityComparer = function (a, b) {
                return a === b;
            };
            break;
        default:
            //case "primitive":
            target.equalityComparer = ko.observable.fn.equalityComparer;
            break;
    }

    return target;
};

ko.extenders.cthrottle = function (target, timeout) {
    target['throttleEvaluation'] = timeout;
    return target;
};
