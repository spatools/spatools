/// <reference path="_definitions.d.ts" />

export interface KnockoutHistoryObservableStatic {
    fn: KnockoutHistoryObservableFunctions<any>;
    <T>(initialValue: T): KnockoutHistoryObservable<T>;
}

export interface KnockoutHistoryObservableFunctions<T> {
    back(): T;
    next(): T;
    replace(value: T): void;
    reset(value?: T): void;
}

export interface KnockoutHistoryObservable<T> extends KnockoutHistoryObservableFunctions<T> {
    (): T;
    (value: T): KnockoutHistoryObservable<T>;

    latestValues: KnockoutObservableArray<T>;
    selectedIndex: KnockoutObservable<number>;

    canGoBack: KnockoutComputed<boolean>;
    canGoForward: KnockoutComputed<boolean>;
}

function historyObservable<T>(initialValue: T): KnockoutHistoryObservable<T> {
    var self = {
        latestValues: ko.observableArray([initialValue]),
        selectedIndex: ko.observable(0)
    };
    $.extend(self, {
        canGoBack: ko.computed(function () { return self.selectedIndex() > 0; }),
        canGoNext: ko.computed(function () { return self.selectedIndex() < self.latestValues._size() - 1; }),
    });
    var result = ko.computed({
        read: function () {
            var index = self.selectedIndex(),
                values = self.latestValues();

            if (index > values.length)
                index = 0;

            return values[index];
        },
        write: function (value) {
            var index = self.selectedIndex();
            if (value !== self.latestValues()[index]) {
                if (index !== self.latestValues._size() - 1) {
                    self.latestValues.splice(index + 1);
                }

                self.latestValues.push(value);
                self.selectedIndex(index + 1);
            }
        }
    }).extend({ cnotify: "reference" });

    $.extend(result, self);
    $.extend(result, history.fn);

    return result;
};
var historyFn = {
    back: function () {
        if (this.canGoBack()) {
            this.selectedIndex(this.selectedIndex() - 1);
        }
        return this();
    },
    next: function () {
        if (this.canGoNext()) {
            this.selectedIndex(this.selectedIndex() + 1);
        }
        return this();
    },
    replace: function (value: any): void {
        var superNotify = _.bind(ko.subscribable.fn.notifySubscribers, this),
            oldValue = this();

        var index = this.selectedIndex();
        this.latestValues.valueWillMutate();
        this.latestValues()[index] = value;
        this.latestValues.valueHasMutated();
    },
    reset: function (value?: any): void {
        if (!value)
            value = this();

        this.latestValues.splice(0, this.latestValues._size(), value);
        this.selectedIndex(0);
    }
};

export var history: KnockoutHistoryObservableStatic = _.extend(historyObservable, { fn: historyFn });

export function validated<T>(initialValue: T): KnockoutValidatedObservable<T> {
    var obsv: any = ko.observable<T>(initialValue),
        isValid = ko.observable(true),
        subscription: KnockoutSubscription<string[]>;

    obsv.subscribe(function (newValue) {
        obsv.errors = ko.validation.group(newValue || {});
        isValid(obsv.errors().length === 0);

        subscription.dispose();
        subscription = obsv.errors.subscribe((errors: string[]) => isValid(errors.length === 0));
    });

    obsv.errors = ko.validation.group(initialValue || {});
    isValid(obsv.errors().length === 0);

    obsv.isValid = ko.computed(() => isValid());
    subscription = obsv.errors.subscribe((errors: string[]) => isValid(errors.length === 0));

    return obsv;
};