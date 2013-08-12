/// <reference path="_data.d.ts" />

import utils = require("../utils");
import dataset = require("./dataset");
import dataview = require("./dataview");
import _query = require("./query");

//#region Interfaces 

export interface RelationView<T> extends dataview.DataView<T> {
    propertyName: string;
    parent: any;

    localSet: dataset.DataSet;
    foreignSet: dataset.DataSet;

    localId: string;
    localIdValue: any;
    foreignId: string;

    ensureRemote: boolean;
}

//#endregion

//#region Model

/** Create an observable relation to many entities */
export function create<T>(propertyName: string, localSet: dataset.DataSet, parent: any, foreignSet: dataset.DataSet, localId: string, foreignId: string, ensureRemote: boolean): RelationView<T> {
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
            var foreigns = foreignSet._filter(function (e) { return e[self.foreignId]() === self.localIdValue; });// result();
            _.each(foreigns, function (foreign) {
                foreign[self.foreignId](newId);
            });

            self.localIdValue = newId;
        }
    });

    ko.utils.extend(result, self);
    ko.utils.extend(result, relationViewFunctions);

    return result;
}

var relationViewFunctions = {
    /** Refresh foreign entities from the server */
    refresh: function (): JQueryPromise<any> {
        if (this.ensureRemote) {
            var foreignSet = this.set,
                localSet = this.localSet,
                query = this.query,
                self = this,
                count;

            return localSet.adapter
                .getRelation(localSet.setName, self.propertyName, ko.utils.unwrapObservable(self.parent[self.localId]))
                .then(function (data) {
                    if (data["odata.metadata"]) {
                        if (data["odata.count"])
                            count = data["odata.count"];

                        data = data.value;
                    }
                    else if (data.__count) {
                        count = data.__count;
                        data = data.results;
                    }
                    else if (!query) {
                        count = data.length;
                    }

                    return data;
                })
                .then(function (data) {
                    var existings = self._map(function (entity) { return foreignSet.getKey(entity); }),
                        news = _.map(data, function (entity) { return foreignSet.getKey(entity); }),
                        filter, args, hasToDelete, toDelete;

                    if (query) {
                        filter = query.toLocalFilter();
                        if (filter)
                            existings = _.filter(existings, filter);

                        hasToDelete = !(query.pageSize() > 0); //TODO: exec view function to check if item is in query
                    }

                    if (hasToDelete) {
                        args = news; args.unshift(existings);
                        toDelete = _.without.apply(_, args);
                        foreignSet.detachRange(toDelete);
                    }

                    return foreignSet.attachOrUpdateRange(data);
                });
        }
        else
            return dataview.dataViewFunctions.refresh.call(this);
    },
    /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        entity[this.foreignId](ko.utils.unwrapObservable(this.parent[this.localId]));
        return this.set.add(entity);
    }
};

//#endregion