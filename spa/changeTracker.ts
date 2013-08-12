/// <reference path="_definitions.d.ts" />

class ChangeTracker {
    private tracked: any;
    private lastData: KnockoutObservable<string>;
    private isModified: KnockoutObservable<bool>;

    public hasChanges: KnockoutComputed<bool>;

    constructor(
        object: any,
        isAlreadyModified: bool = false,
        private hashFunction: (obj: any, params?: any) => string = ko.toJSON,
        private params?: any) {

            this.tracked = object;
            this.lastData = ko.observable(hashFunction(object, params));
            this.isModified = ko.observable(isAlreadyModified);
            
            this.hasChanges = ko.computed(function () {
                return this.isModified() || this.hashFunction(this.tracked, this.params) !== this.lastData();
            }, this);
    }

    reset = function () {
        this.lastData(this.hashFunction(this.tracked, this.params));
        this.isModified(false);
    }
}

export = ChangeTracker;