/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import dataview = require("./dataview");
import _query = require("./query");

//#region Interfaces 

export interface RelationView<T, TKey, TForeign, TForeignKey> extends dataview.DataView<TForeign, TForeignKey> {
    propertyName: string;
    parent: any;

    localSet: dataset.DataSet<T, TKey>;
    foreignSet: dataset.DataSet<TForeign, TForeignKey>;

    localId: string;
    localIdValue: any;
    foreignId: string;

    ensureRemote: boolean;
}

//#endregion

//#region Model

/** Create an observable relation to many entities */
export function create<T, TKey, TForeign, TForeignKey>(propertyName: string, localSet: dataset.DataSet<T, TKey>, parent: any, foreignSet: dataset.DataSet<TForeign, TForeignKey>, localId: string, foreignId: string, ensureRemote: boolean): RelationView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: propertyName,
        parent: parent,
        localId: localId,
        localSet: localSet,
        localIdValue: ko.utils.unwrapObservable(parent[localId]),
        foreignId: foreignId,
        ensureRemote: ensureRemote
    };

    var result: any = foreignSet.createView(new _query.ODataQuery().where(self.foreignId, _query.operator.equal, self.parent[self.localId]));
    
    self.parent[self.localId].subscribe(function (newId) {
        if (self.localIdValue !== newId) {
            var foreigns = foreignSet.filter(e => e[self.foreignId]() === self.localIdValue);
            _.each(foreigns, foreign => foreign[self.foreignId](newId));

            self.localIdValue = newId;
        }
    });

    ko.utils.extend(result, self);
    ko.utils.extend(result, relationViewFunctions);

    return result;
}

var relationViewFunctions = {
    /** Refresh foreign entities from the server */
    refresh: function (mode: string = "remote"): JQueryPromise<any[]> {
        var self = <RelationView<any, any, any, any>>this;
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
