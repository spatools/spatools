/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import dataview = require("./dataview");
import _query = require("./query");

//#region Interfaces 

export interface ForeignView<T, TKey, TForeign, TForeignKey> extends ForeignViewFunctions<T, TKey, TForeign, TForeignKey> {
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

export interface ForeignViewFunctions<T, TKey, TForeign, TForeignKey> {
    /** Refresh the foreign entity from the server */
    refresh(): JQueryPromise<TForeign[]>;
    /** Update entity into dataSet, if buffer is false, changes will be instantly committed to the server */
    update(): void;
    /** Change actual related entity with new one and delete if specified */
    change(newEntity: TForeign, deleteOld?: boolean): JQueryPromise<any>;
    /** Save changes of foreign entity to the server */
    save(): JQueryPromise<TForeign>;
}

//#endregion

//#region Model

/** Create an observable relation to one item */
export function create<T, TKey, TForeign, TForeignKey>(propertyName: string, localSet: dataset.DataSet<T, TKey>, parent: any, foreignSet: dataset.DataSet<TForeign, TForeignKey>, localId: string, ensureRemote: boolean): ForeignView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: propertyName,
        parent: parent,
        localSet: localSet,
        foreignSet: foreignSet,
        localId: localId,
        foreignId: foreignSet.key,
        view: foreignSet.createView((new _query.ODataQuery()).where(foreignSet.key, _query.operator.equal, parent[localId])),
        ensureRemote: ensureRemote
    };

    var result: any = self.view._first(),
        foreign = result(),
        subscription = null;

    result.subscribe(function (newForeign) {
        setTimeout(function () {
            if (foreign !== newForeign) {
                if (subscription) {
                    subscription.dispose();
                    subscription = null;
                }

                if (newForeign) {
                    subscription = newForeign[self.foreignId].subscribe(function (newId) {
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

var foreignViewFunctions: ForeignViewFunctions<any, any, any, any> = {
    /** Refresh the foreign entity from the server */
    refresh: function (mode: string = "remote"): JQueryPromise<any> {
        var self = <ForeignView<any, any, any, any>>this;
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
    change: function(newEntity: any, deleteOld: boolean = false): JQueryPromise<any> {
        var self = this,
            entity = this(),
            deferred = this.foreignSet.isAttached(newEntity) ? newEntity : this.foreignSet.add(newEntity);

        return $.when(deferred)
            .then(function () {
                self.parent[self.localId](ko.utils.unwrapObservable(newEntity[self.foreignId]));

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
