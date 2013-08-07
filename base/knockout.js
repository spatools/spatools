var spa;
(function (spa) {
    ko._validatedObservable = function (initialValue) {
        var obsv = ko.observable(initialValue), isValid = ko.observable(true), subscription;

        obsv.subscribe(function (newValue) {
            obsv.errors = ko.validation.group(newValue || {});
            isValid(obsv.errors().length === 0);

            subscription.dispose();
            subscription = obsv.errors.subscribe(function (errors) {
                return isValid(errors.length === 0);
            });
        });

        obsv.errors = ko.validation.group(initialValue || {});
        isValid(obsv.errors().length === 0);

        obsv.isValid = ko.computed(function () {
            return isValid();
        });
        subscription = obsv.errors.subscribe(function (errors) {
            return isValid(errors.length === 0);
        });

        return obsv;
    };

    var historyObservable = function (initialValue) {
        var self = {
            latestValues: ko.observableArray([initialValue]),
            selectedIndex: ko.observable(0)
        };
        $.extend(self, {
            canGoBack: ko.computed(function () {
                return self.selectedIndex() > 0;
            }),
            canGoNext: ko.computed(function () {
                return self.selectedIndex() < self.latestValues._size() - 1;
            })
        });
        var result = ko.computed({
            read: function () {
                var index = self.selectedIndex(), values = self.latestValues();

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
            var superNotify = _.bind(ko.subscribable.fn.notifySubscribers, this), oldValue = this();

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
})(spa || (spa = {}));
