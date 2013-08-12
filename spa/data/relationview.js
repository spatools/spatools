define(["require", "exports", "./dataview", "./query"], function(require, exports, __dataview__, ___query__) {
    
    
    var dataview = __dataview__;
    var _query = ___query__;

    //#endregion
    //#region Model
    /** Create an observable relation to many entities */
    function create(propertyName, localSet, parent, foreignSet, localId, foreignId, ensureRemote) {
        var self = {
            propertyName: propertyName,
            parent: parent,
            localId: localId,
            localSet: localSet,
            localIdValue: ko.utils.unwrapObservable(parent[localId]),
            foreignId: foreignId,
            ensureRemote: ensureRemote
        };

        var result = foreignSet.createView(new _query.ODataQuery().where(self.foreignId, _query.operator.equal, self.parent[self.localId]));

        self.parent[self.localId].subscribe(function (newId) {
            if (self.localIdValue !== newId) {
                var foreigns = foreignSet._filter(function (e) {
                    return e[self.foreignId]() === self.localIdValue;
                });
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
    exports.create = create;

    var relationViewFunctions = {
        /** Refresh foreign entities from the server */
        refresh: function () {
            if (this.ensureRemote) {
                var foreignSet = this.set, localSet = this.localSet, query = this.query, self = this, count;

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
            } else
                return dataview.dataViewFunctions.refresh.call(this);
        },
        /** Add entity to foreign entities and set it good value in foreign key, if buffer is false, entity will be instantly post on the server */
        add: function (entity) {
            entity[this.foreignId](ko.utils.unwrapObservable(this.parent[this.localId]));
            return this.set.add(entity);
        }
    };
});
