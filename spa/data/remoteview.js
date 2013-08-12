define(["require", "exports"], function(require, exports) {
    

    //#endregion
    //#region Model
    /** Create an observable relation to many entities */
    function create(propertyName, localSet, parent, foreignSet, localId) {
        var self = {
            propertyName: propertyName,
            parent: parent,
            localId: localId,
            localSet: localSet,
            foreignSet: foreignSet
        };

        var result = ko.observableArray();

        ko.utils.extend(result, self);
        ko.utils.extend(result, exports.remoteViewFunctions);

        return result;
    }
    exports.create = create;

    exports.remoteViewFunctions = {
        /** Refresh foreign entities from the server */
        refresh: function () {
            var foreignSet = this.foreignSet, localSet = this.localSet, query = this.query, self = this, count;

            return localSet.adapter.getRelation(localSet.setName, self.propertyName, ko.utils.unwrapObservable(self.parent[self.localId])).then(function (data) {
                if (data["odata.metadata"]) {
                    if (data["odata.count"])
                        count = data["odata.count"];

                    data = data.value;
                } else if (data.__count) {
                    count = data.__count;
                    data = data.results;
                } else if (!query) {
                    count = data.length;
                }

                return data;
            }).then(function (data) {
                //if (refresh === true) {
                var existings = self._map(function (entity) {
                    return foreignSet.getKey(entity);
                }), news = _.map(data, function (entity) {
                    return foreignSet.getKey(entity);
                }), filter, args, hasToDelete, toDelete;

                if (query) {
                    filter = query.toLocalFilter();
                    if (filter)
                        existings = _.filter(existings, filter);

                    hasToDelete = !(query.pageSize() > 0);
                }

                if (hasToDelete) {
                    args = news;
                    args.unshift(existings);
                    toDelete = _.without.apply(_, args);
                    foreignSet.detachRange(toDelete);
                }

                return foreignSet.attachOrUpdateRange(data);
            });
        },
        /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
        add: function (entity) {
            //TODO
            return $.when();
        },
        /** Update entity on relation, if buffer is false, entity will be instantly put on the server */
        update: function (entity) {
            //TODO
            return $.when();
        },
        /** Remove entity from relation, if buffer is false, entity will be instantly delete on the server */
        remove: function (entity) {
            //TODO
            return $.when();
        }
    };
});
