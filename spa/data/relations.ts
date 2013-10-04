/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import dataview = require("./dataview");
import mapping = require("./mapping");
import _query = require("./query");

//#region Common Methods

export function create<T, TKey, TForeign, TForeignKey>(localSet: dataset.DataSet<T, TKey>, foreignSet: dataset.DataSet<TForeign, TForeignKey>, relation: mapping.Relation, entity: any): any {
    switch (relation.type) {
        case 0: //mapping.relationTypes.many:
            return collection(localSet, foreignSet, relation, entity);
        case 1: //mapping.relationTypes.one:
            return foreign(localSet, foreignSet, relation, entity);
        case 2: //mapping.relationTypes.remote:
            return remote(localSet, foreignSet, relation, entity);
    }
}

//#endregion

//#region Collection View 

export interface RelationCollectionView<T, TKey, TForeign, TForeignKey> extends dataview.DataView<TForeign, TForeignKey> {
    propertyName: string;
    parent: any;

    localSet: dataset.DataSet<T, TKey>;
    foreignSet: dataset.DataSet<TForeign, TForeignKey>;
    localId: string;
    foreignId: string;

    ensureRemote: boolean;
}
export interface CollectionView<T, TForeign> extends RelationCollectionView<T, any, TForeign, any> { }
export interface Collection<TForeign> extends CollectionView<any, TForeign> { }

/** Create an observable relation to many entities */
export function collection<T, TKey, TForeign, TForeignKey>(localSet: dataset.DataSet<T, TKey>, foreignSet: dataset.DataSet<TForeign, TForeignKey>, relation: mapping.Relation, parent: any): RelationCollectionView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: relation.propertyName,
        parent: parent,

        localSet: localSet,
        foreignSet: foreignSet,
        localId: localSet.key,
        foreignId: relation.foreignKey,

        ensureRemote: relation.ensureRemote
    };

    var result: any = foreignSet.createView(relation.toQuery(parent, localSet, foreignSet));

    var localIdValue = ko.unwrap(parent[localSet.key]);
    self.parent[self.localId].subscribe(newId => {
        if (localIdValue !== newId) {
            var foreigns = foreignSet.filter(e => e[self.foreignId]() === localIdValue);
            _.each(foreigns, foreign => foreign[self.foreignId](newId));

            localIdValue = newId;
        }
    });

    ko.utils.extend(result, self);
    ko.utils.extend(result, collectionViewFunctions);

    return result;
}

var collectionViewFunctions = {
    /** Refresh foreign entities from the server */
    refresh: function (mode?: string): JQueryPromise<any[]> {
        var self = <Collection<any>>this;
        if (self.ensureRemote) {
            return self.localSet.refreshRelation(parent, self.propertyName, mode, self.query);
        }
        else {
            return self.set.refresh(mode, self.query).done(data => {
                if (self.query.pageSize() > 0)
                    self.lastResult(data);
            });
        }
    },
    /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        entity[this.foreignId](ko.unwrap(this.parent[this.localId]));
        return this.set.add(entity);
    }
};

//#endregion

//#region Foreign View

export interface RelationForeignView<T, TKey, TForeign, TForeignKey> extends RelationForeignViewFunctions<T, TKey, TForeign, TForeignKey> {
    (): T;

    propertyName: string;
    parent: any;

    localSet: dataset.DataSet<T, TKey>;
    foreignSet: dataset.DataSet<TForeign, TForeignKey>;
    localId: string;
    foreignId: string;
    
    view: dataview.DataView<TForeign, TForeignKey>;
    ensureRemote: boolean;
}
export interface ForeignView<T, TForeign> extends RelationForeignView<T, any, TForeign, any> { }
export interface Foreign<TForeign> extends ForeignView<any, TForeign> { }

export interface RelationForeignViewFunctions<T, TKey, TForeign, TForeignKey> {
    /** Refresh the foreign entity from the server */
    refresh(mode?: string): JQueryPromise<TForeign[]>;
    /** Update entity into dataSet, if buffer is false, changes will be instantly committed to the server */
    update(): void;
    /** Change actual related entity with new one and delete if specified */
    change(newEntity: TForeign, deleteOld?: boolean): JQueryPromise<any>;
    /** Save changes of foreign entity to the server */
    save(): JQueryPromise<TForeign>;
}

/** Create an observable relation to one item */
export function foreign<T, TKey, TForeign, TForeignKey>(localSet: dataset.DataSet<T, TKey>, foreignSet: dataset.DataSet<TForeign, TForeignKey>, relation: mapping.Relation, parent: any): RelationForeignView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: relation.propertyName,
        parent: parent,

        localSet: localSet,
        foreignSet: foreignSet,
        localId: relation.foreignKey,
        foreignId: foreignSet.key,

        view: foreignSet.createView(relation.toQuery(parent, localSet, foreignSet)),
        ensureRemote: relation.ensureRemote
    };

    var result: any = self.view._first(),
        foreign = result(),
        subscription = null;

    result.subscribe(newForeign => {
        setTimeout(() => {
            if (foreign !== newForeign) {
                if (subscription) {
                    subscription.dispose();
                    subscription = null;
                }

                if (newForeign) {
                    subscription = newForeign[self.foreignId].subscribe(newId => {
                        self.parent[self.localId](newId);
                    });
                }

                foreign = newForeign;
            }
        }, 1);
    });

    ko.utils.extend(result, self);
    ko.utils.extend(result, foreignViewFunctions);

    return result;
}

var foreignViewFunctions: RelationForeignViewFunctions<any, any, any, any> = {
    /** Refresh the foreign entity from the server */
    refresh: function (mode?: string): JQueryPromise<any> {
        var self = <Foreign<any>>this;
        if (self.ensureRemote) {
            return self.foreignSet.refreshRelation(parent, self.propertyName, mode, self.view.query);
        }
        else {
            return self.view.refresh(mode);
        }
    },
    /** Update entity into dataSet, if buffer is false, changes will be instantly committed to the server */
    update: function (): void {
        var entity = this();
        if (entity)
            this.view.update(entity);
    },
    /** Change actual related entity with new one and delete if specified */
    change: function (newEntity: any, deleteOld: boolean = false): JQueryPromise<any> {
        var self = this,
            entity = this(),
            deferred = this.foreignSet.isAttached(newEntity) ? newEntity : this.foreignSet.add(newEntity);

        return $.when(deferred)
            .then(function () {
                self.parent[self.localId](ko.unwrap(newEntity[self.foreignId]));

                if (deleteOld && entity)
                    return self.foreignSet.remove(entity);
            })
            .then(() => newEntity);
    },
    /** Save changes of foreign entity to the server */
    save: function (): JQueryPromise<any> {
        var entity = this();
        return $.when(entity && this.view.saveEntity(entity));
    }
};

//#endregion

//#region RemoteView

export interface RelationRemoteView<T, TKey, TForeign, TForeignKey> extends KnockoutObservableArray<TForeign> { }
export interface RelationRemoteView<T, TKey, TForeign, TForeignKey> extends RelationRemoteViewFunctions<T, TKey, TForeign, TForeignKey> {
    propertyName: string;
    parent: any;

    localSet: dataset.DataSet<T, TKey>;
    foreignSet: dataset.DataSet<TForeign, TForeignKey>;

    query: _query.ODataQuery;
}
export interface RemoteView<T, TForeign> extends RelationRemoteView<T, any, TForeign, any> { }
export interface Remote<TForeign> extends RemoteView<any, TForeign> { }

export interface RelationRemoteViewFunctions<T, TKey, TForeign, TForeignKey> {
    /** Refresh foreign entities from the server */
    refresh(): JQueryPromise<TForeign[]>;
    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add(entity: TForeign): JQueryPromise<TForeign>;
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update(entity: TForeign): JQueryPromise<any>;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: TForeign): JQueryPromise<any>;
}

/** Create an observable relation to many entities */
export function remote<T, TKey, TForeign, TForeignKey>(localSet: dataset.DataSet<T, TKey>, foreignSet: dataset.DataSet<TForeign, TForeignKey>, relation: mapping.Relation, parent: any): RelationRemoteView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: relation.propertyName,
        parent: parent,

        localSet: localSet,
        foreignSet: foreignSet,

        query: new _query.ODataQuery()
    };

    var result: any = ko.observableArray();

    ko.utils.extend(result, self);
    ko.utils.extend(result, remoteViewFunctions);

    return result;
}

export var remoteViewFunctions: RelationRemoteViewFunctions<any, any, any, any> = {
    /** Refresh foreign entities from the server */
    refresh: function (mode?: string): JQueryPromise<any[]> {
        var self = <Remote<any>>this;
        if (!mode) mode = self.localSet.refreshMode;

        if (mode === "local") {
            return $.when([]);
        }

        return self.localSet.refreshRelation(self.parent, self.propertyName, mode, self.query).then(result => { self(result.data); });
    },
    /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        return $.when(entity); // TODO
    },
    /** Update entity on relation, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): JQueryPromise<any> {
        return $.when(entity); // TODO
    },
    /** Remove entity from relation, if buffer is false, entity will be instantly delete on the server */
    remove: function (entity: any): JQueryPromise<any> {
        return $.when(entity); // TODO
    }
};

//#endregion
