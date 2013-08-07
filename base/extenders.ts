/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />

interface KnockoutExtenders {
    moment: (target: any, options: Object) => any;
    momentDuration: (target: any, options: any) => any;
    delay: (target: any, delay: number) => any;
    cnotify: (target: any, notifyWhen: any) => any;
    cthrottle: (target: any, timeout: number) => any;
    //notify: (target: any, notifyWhen: string, customEqualityComparer: (v1: any, v2: any) => number) => any;
}

ko.extenders.delay = function (target: any, delay: number): any {
    var value = target();

    target.timer = null;
    target.immediate = ko.observable(value);

    target.subscribe(target.immediate);
    target.immediate.subscribe(function (newValue) {
        if (newValue !== target()) {
            if (target.timer) {
                clearTimeout(target.timer);
            }

            target.timer = setTimeout(() => target(newValue), delay);
        }
    });

    return target;
};

ko.extenders.cnotify = function (target: any, notifyWhen: any): any {
    var latestValue = null,
        superNotify = _.bind(ko.subscribable.fn.notifySubscribers, target),
        notify = function (value) {
            superNotify(latestValue, "beforeChange");
            superNotify(value);
        };
    
    target.notifySubscribers = function (value, event) {
        if (_.isFunction(notifyWhen)) { // custom
            if (event === "beforeChange") {
                latestValue = target.peek()
                }
            else if (!notifyWhen(latestValue, value)) {
                notify(value);
            }
            return;
        }

        switch (notifyWhen) {
            case "primitive":
                if (event === "beforeChange") {
                    latestValue = target.peek()
                    }
                else if (!ko.observable.fn.equalityComparer(latestValue, value)) {
                    notify(value);
                }
                break;
            case "reference":
                if (event === "beforeChange") {
                    latestValue = target.peek()
                    }
                else if (latestValue !== value) {
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

ko.extenders.notify = function (target: any, notifyWhen: any): any {
    if (_.isFunction(notifyWhen)) { // custom
        target.equalityComparer = notifyWhen;
        return target;
    }
    switch (notifyWhen) {
        case "always":
            target.equalityComparer = () => false
            break;
        case "manual":
            target.equalityComparer = () => true;
            break;
        case "reference":
            target.equalityComparer = (a, b) => a === b;
            break;
        default:
            //case "primitive":
            target.equalityComparer = ko.observable.fn.equalityComparer;
            break;
    }

    return target;
};

ko.extenders.cthrottle = function (target: any, timeout: number): any {
    target['throttleEvaluation'] = timeout;
    return target;
};
