/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />

interface KnockoutStatic {
    _validatedObservable<T>(initialValue: T): KnockoutObservable<T>;
    historyObservable: KnockoutHistoryObservableStatic;
}

interface KnockoutHistoryObservableFunctions<T> {
    back(): KnockoutHistoryObservable<T>;
    next(): KnockoutHistoryObservable<T>;
    replace(value: any): void;
    reset(value?: any): void;
}

interface KnockoutHistoryObservable<T> extends KnockoutHistoryObservableFunctions<T> {
    (): T;
    (value: T): KnockoutHistoryObservable<T>;

    latestValues: KnockoutObservableArray<T>;
    selectedIndex: KnockoutObservable<number>;

    canGoBack: KnockoutComputed<boolean>;
    canGoForward: KnockoutComputed<boolean>;
}

interface KnockoutHistoryObservableStatic {
    fn: KnockoutHistoryObservableFunctions<any>;
    <T>(initialValue: T): KnockoutHistoryObservable<T>;
}

interface KnockoutSubscribableFunctions {
    errors?: KnockoutValidationErrors;
}

interface KnockoutValidationErrors {
    subscribe(callback: (newValue: string[]) => void , target?: any, topic?: string): KnockoutSubscription;
}
module spa {
    ko._validatedObservable = function <T>(initialValue: T): KnockoutObservable<T> {
        var obsv = ko.observable<T>(initialValue),
            isValid = ko.observable(true),
            subscription: KnockoutSubscription;

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

    var historyObservable: any = function <T>(initialValue: T): KnockoutHistoryObservable<T> {
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
        $.extend(result, ko.historyObservable.fn);

        return result;
    };
    historyObservable.fn = {
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
        replace: function (value) {
            var superNotify = _.bind(ko.subscribable.fn.notifySubscribers, this),
                oldValue = this();

            var index = this.selectedIndex();
            this.latestValues.valueWillMutate();
            this.latestValues()[index] = value;
            this.latestValues.valueHasMutated();
        },
        reset: function (value) {
            if (!value)
                value = this();

            this.latestValues.splice(0, this.latestValues._size(), value);
            this.selectedIndex(0);
        }
    };
    ko.historyObservable = historyObservable;
}