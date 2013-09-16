/// <reference path="_definitions.d.ts" />

class ChangeTracker {
    private tracked: any;
    private lastData: KnockoutObservable<string>;
    private isModified: KnockoutObservable<boolean>;

    public hasChanges: KnockoutComputed<boolean>;

    constructor(
        object: any,
        isAlreadyModified: boolean = false,
        private hashFunction: (obj: any, params?: any) => string = ko.toJSON,
        private params?: any) {

            this.tracked = object;
            this.lastData = ko.observable(hashFunction(object, params));
            this.isModified = ko.observable(isAlreadyModified);
            
            this.hasChanges = ko.computed(function () {
                return this.isModified() || this.hashFunction(this.tracked, this.params) !== this.lastData();
            }, this);
    }

    public reset() {
        this.lastData(this.hashFunction(this.tracked, this.params));
        this.isModified(false);
    }
}

export = ChangeTracker;
