/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import _query = require("./query");

//#region Interfaces 

export interface DataView<T> extends KnockoutUnderscoreArrayFunctions, DataViewFunctions {
    (): T[];

    set: dataset.DataSet;
    query: _query.ODataQuery;
    lastResult: KnockoutObservableArray<T>;
}

export interface DataViewFunctions {
    /** Refresh the view from the server */
    refresh(): JQueryPromise<any>;
    /** Load a remote entity by key */
    load(key: any): JQueryPromise<any>;

    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add(entity: any): JQueryPromise<any>;
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update(entity: any): void;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: any): void;

    findByKey(key: any): any;

    /** Save changes of an entity to the server */
    saveEntity(entity: any): JQueryPromise<any>;
    /** Reset entity to its original state */
    resetEntity(entity: any): void;

    /** Get a report of changes in the dataview */
    getChanges(): any;
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges(): JQueryPromise<any>;
}

//#endregion

//#region Model

/** Creates a data view for the given data set */
export function create<T>(dataSet: dataset.DataSet, query?: _query.ODataQuery): DataView<T> {
    var self = {
        query: query || new _query.ODataQuery(),
        set: dataSet,
        lastResult: ko.observableArray()
    };

    var result = ko.computed(function () {
        if (self.query.pageSize() > 0 && !self.set.isSynchronized() && self.lastResult._size() > 0)
            return self.lastResult();

        return self.query.apply(self.set._toArray(), true);
    }).extend({ cnotify: utils.arrayEquals, deferEvaluation: true });

    ko.utils.extend(result, self);
    ko.utils.extend(result, dataViewFunctions);

    return result;
}

export var dataViewFunctions: DataViewFunctions = {
    /** Refresh the view from the server */
    refresh: function (): JQueryPromise<any> {
        var self = this;
        return this.set
            .query(this.query, true)
            .done(function (data) {
                if (self.query.pageSize() > 0)
                    self.lastResult(data);
            });
    },
    /** Load a remote entity by key */
    load: function (key: any): JQueryPromise<any> {
        return this.set.load(key);
    },

    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        return this.set.add(entity);
    },
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): void {
        this.set.update(entity);
    },
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove: function (entity: any): void {
        this.set.remove(entity);
    },

    findByKey: function (key: any): any {
        return this.set.findByKey(key);
    },

    /** Save changes of an entity to the server */
    saveEntity: function (entity: any): JQueryPromise<any> {
        return this.set.saveEntity(entity);
    },
    /** Reset entity to its original state */
    resetEntity: function (entity: any): void {
        this.set.resetEntity(entity);
    },

    /** Get a report of changes in the dataview */
    getChanges: function (): any {
        return _.groupBy(this(), function (e) { return e.EntityState(); });
    },
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges: function (): JQueryPromise<any> {
        /// <summary>Commits all Pending Operations (PUT, DELETE, POST)</summary>
        /// <returnss type="$.Deffered">return a deffered object for async operations</returnss>
        var changes = this.getChanges(),
            set = this.set,
            deferreds = [];

        _.each(changes.added, function (e) { deferreds.push(set._remoteCreate(e)); });
        _.each(changes.modified, function (e) { deferreds.push(set._remoteUpdate(e)); });
        _.each(changes.deleted, function (e) { deferreds.push(set._remoteRemove(e)); });

        return $.when.apply($, deferreds);
    }
};
ko.utils.extend(dataViewFunctions, spa.underscore.collections);

//#endregion