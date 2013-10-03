/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import mapping = require("./mapping");
import underscore = require("../underscore");
import _query = require("./query");

//#region Interfaces 

export interface DataView<T, TKey> extends KnockoutUnderscoreArrayFunctions<T> { }
export interface DataView<T, TKey> extends KnockoutComputed<T> { }
export interface DataView<T, TKey> extends DataViewFunctions<T, TKey> {
    set: dataset.DataSet<T, TKey>;
    query: _query.ODataQuery;
    lastResult: KnockoutObservableArray<T>;
}

export interface DataViewFunctions<T, TKey> {
    /** Refresh the view from the server */
    refresh(mode?: string): JQueryPromise<any>;
    /** Load a remote entity by key */
    load(key: TKey, mode?: string): JQueryPromise<T>;

    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add(entity: T): JQueryPromise<any>;
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update(entity: T): void;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: T): void;

    findByKey(key: TKey): any;

    /** Save changes of an entity to the server */
    saveEntity(entity: T): JQueryPromise<T>;
    /** Reset entity to its original state */
    resetEntity(entity: T): void;

    /** Get a report of changes in the dataview */
    getChanges(): any;
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges(): JQueryPromise<any>;
}

//#endregion

//#region Model

/** Creates a data view for the given data set */
export function create<T, TKey>(dataSet: dataset.DataSet<T, TKey>, query?: _query.ODataQuery): DataView<T, TKey> {
    var self = {
        query: query || new _query.ODataQuery(),
        set: dataSet,
        lastResult: ko.observableArray()
    };

    var result = ko.computed(function () {
        if (self.query.pageSize() > 0 && !self.set.isSynchronized() && self.lastResult.size() > 0) {
            return self.lastResult();
        }

        return self.query.apply(self.set.toArray(), true);
    }).extend({ cnotify: utils.arrayEquals, deferEvaluation: true });

    ko.utils.extend(result, self);
    ko.utils.extend(result, dataViewFunctions);

    return result;
}

export var dataViewFunctions: DataViewFunctions<any, any> = {
    /** Refresh the view from the server */
    refresh: function (mode: string = "remote"): JQueryPromise<any> {
        var self = <DataView<any, any>>this;
        return self.set.refresh(mode, self.query).done(function (data) {
            if (self.query.pageSize() > 0)
                self.lastResult(data);
        });
    },
    /** Load a remote entity by key */
    load: function (key: any, mode: string = "remote"): JQueryPromise<any> {
        return this.set.load(key, mode, this.query);
    },

    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        return this.set.add(entity);
    },
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): JQueryPromise<any> {
        return this.set.update(entity);
    },
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove: function (entity: any): JQueryPromise<any> {
        return this.set.remove(entity);
    },

    findByKey: function (key: any): any {
        return this.set.findByKey(key);
    },

    /** Save changes of an entity to the server */
    saveEntity: function (entity: any): JQueryPromise<any> {
        return this.set.saveEntity(entity);
    },
    /** Reset entity to its original state */
    resetEntity: function (entity: any): JQueryPromise<any> {
        return this.set.resetEntity(entity);
    },

    /** Get a report of changes in the dataview */
    getChanges: function (): any {
        return this.groupBy(e => e.EntityState());
    },
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges: function (): JQueryPromise<any> {
        /// <summary>Commits all Pending Operations (PUT, DELETE, POST)</summary>
        /// <returnss type="$.Deffered">return a deffered object for async operations</returnss>
        var changes = this.getChanges(),
            set = (<DataView<any, any>>this).set,
            states = mapping.entityStates,
            deferreds = _.union(
                _.map(changes[states.added], e => set._remoteCreate(e)),
                _.map(changes[states.modified], e => set._remoteUpdate(e)),
                _.map(changes[states.removed], e => set._remoteRemove(e))
            );

        return $.when.apply($, deferreds);
    }
};

ko.utils.extend(dataViewFunctions, underscore.collections);

//#endregion
