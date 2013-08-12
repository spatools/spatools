/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import dataview = require("./dataview");
import _query = require("./query");

//#region Interfaces 

export interface ForeignView<T> extends ForeignViewFunctions {
    (): T;

    propertyName: string;
    parent: any;

    localSet: dataset.DataSet;
    foreignSet: dataset.DataSet;

    localId: string;
    foreignId: string;
    
    view: dataview.DataView<T>;
    ensureRemote: boolean;
}

export interface ForeignViewFunctions {
    /** Refresh the foreign entity from the server */
    refresh(): JQueryPromise<any>;
    /** Update entity into dataSet, if buffer is false, changes will be instantly committed to the server */
    update(): void;
    /** Change actual related entity with new one and delete if specified */
    change(newEntity: any, deleteOld?: boolean): JQueryPromise<any>;
    /** Save changes of foreign entity to the server */
    save(): JQueryPromise<any>;
}

//#endregion

//#region Model

/** Create an observable relation to one item */
export function create<T>(propertyName: string, localSet: dataset.DataSet, parent: any, foreignSet: dataset.DataSet, localId: string, ensureRemote: boolean): ForeignView<T> {
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

    var result: any = self.view.first(),
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

var foreignViewFunctions: ForeignViewFunctions = {
    /** Refresh the foreign entity from the server */
    refresh: function (): JQueryPromise<any> {
        if (this.ensureRemote) {
            var deferred = $.Deferred(),
                foreignSet = this.view.set,
                localSet = this.localSet,
                self = this, result;

            localSet.adapter
                .getRelation(localSet.setName, self.propertyName, ko.utils.unwrapObservable(self.parent[self.localId]))
                .done(function (data) {
                    var count = -1;

                    if (data["odata.metadata"]) {
                        if (data["odata.count"])
                            count = data["odata.count"];

                        data = data.value;
                    }

                    result = foreignSet.attachOrUpdate(data);

                    deferred.resolve(result, count === -1 ? data.length : count);
                })
                .fail(deferred.reject);

            return deferred.promise();
        }
        else
            return this.view.refresh(true);
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