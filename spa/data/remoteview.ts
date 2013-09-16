/// <reference path="_data.d.ts" />

import dataset = require("./dataset");

//#region Interfaces 

export interface RemoteView<T, TKey, TForeign, TForeignKey> extends KnockoutObservableArray<TForeign>, RemoteViewFunctions<T, TKey, TForeign, TForeignKey> {
    propertyName: string;
    parent: any;
    localId: string;
    localSet: dataset.DataSet<T, TKey>;
    foreignSet: dataset.DataSet<TForeign, TForeignKey>;
}

export interface RemoteViewFunctions<T, TKey, TForeign, TForeignKey> {
    /** Refresh foreign entities from the server */
    refresh(): JQueryPromise<TForeign[]>;
    /** Add entity to view, if buffer is false, entity will be instantly post on the server */
    add(entity: TForeign): JQueryPromise<TForeign>;
    /** Update entity on view, if buffer is false, entity will be instantly put on the server */
    update(entity: TForeign): JQueryPromise<any>;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: TForeign): JQueryPromise<any>;
}

//#endregion

//#region Model

/** Create an observable relation to many entities */
export function create<T, TKey, TForeign, TForeignKey>(propertyName: string, localSet: dataset.DataSet<T, TKey>, parent: any, foreignSet: dataset.DataSet<TForeign, TForeignKey>, localId: string): RemoteView<T, TKey, TForeign, TForeignKey> {
    var self = {
        propertyName: propertyName,
        parent: parent,
        localId: localId,
        localSet: localSet,
        foreignSet: foreignSet
    };

    var result: any = ko.observableArray();

    ko.utils.extend(result, self);
    ko.utils.extend(result, remoteViewFunctions);

    return result;
}

export var remoteViewFunctions: RemoteViewFunctions<any, any, any, any> = {
    /** Refresh foreign entities from the server */
    refresh: function (): JQueryPromise<any> {
        var foreignSet = this.foreignSet,
            localSet = this.localSet,
            query = this.query,
            self = this, count;

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
                //if (refresh === true) {
                var existings = self.map(function (entity) { return foreignSet.getKey(entity); }),
                    news = _.map(data, function (entity) { return foreignSet.getKey(entity); }),
                    filter, args, hasToDelete, toDelete;

                if (query) {
                    filter = query.toLocalFilter();
                    if (filter)
                        existings = _.filter(existings, filter);

                    hasToDelete = (query.pageSize() <= 0); //TODO: exec view function to check if item is in query
                }

                if (hasToDelete) {
                    args = news; args.unshift(existings);
                    toDelete = _.without.apply(_, args);
                    foreignSet.detachRange(toDelete);
                }

                return foreignSet.attachOrUpdateRange(data);
                //}
                //else {
                //    return _.map(data, foreignSet.fromJS, foreignSet);
                //}
            });
    },
    /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        //TODO
        return $.when();
    },
    /** Update entity on relation, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): JQueryPromise<any> {
        //TODO
        return $.when();
    },
    /** Remove entity from relation, if buffer is false, entity will be instantly delete on the server */
    remove: function (entity: any): JQueryPromise<any> {
        //TODO
        return $.when();
    }
};

//#endregion
