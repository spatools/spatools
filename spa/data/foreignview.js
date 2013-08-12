define(["require", "exports", "./query"], function(require, exports, ___query__) {
    
    
    
    var _query = ___query__;

    //#endregion
    //#region Model
    /** Create an observable relation to one item */
    function create(propertyName, localSet, parent, foreignSet, localId, ensureRemote) {
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

        var result = self.view.first(), foreign = result(), subscription = null;

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
    exports.create = create;

    var foreignViewFunctions = {
        /** Refresh the foreign entity from the server */
        refresh: function () {
            if (this.ensureRemote) {
                var deferred = $.Deferred(), foreignSet = this.view.set, localSet = this.localSet, self = this, result;

                localSet.adapter.getRelation(localSet.setName, self.propertyName, ko.utils.unwrapObservable(self.parent[self.localId])).done(function (data) {
                    var count = -1;

                    if (data["odata.metadata"]) {
                        if (data["odata.count"])
                            count = data["odata.count"];

                        data = data.value;
                    }

                    result = foreignSet.attachOrUpdate(data);

                    deferred.resolve(result, count === -1 ? data.length : count);
                }).fail(deferred.reject);

                return deferred.promise();
            } else
                return this.view.refresh(true);
        },
        /** Update entity into dataSet, if buffer is false, changes will be instantly committed to the server */
        update: function () {
            var entity = this();
            if (entity)
                this.view.update(entity);
        },
        /** Change actual related entity with new one and delete if specified */
        change: function (newEntity, deleteOld) {
            if (typeof deleteOld === "undefined") { deleteOld = false; }
            var self = this, entity = this(), deferred = this.foreignSet.isAttached(newEntity) ? newEntity : this.foreignSet.add(newEntity);

            return $.when(deferred).then(function () {
                self.parent[self.localId](ko.utils.unwrapObservable(newEntity[self.foreignId]));

                if (deleteOld && entity)
                    return self.foreignSet.remove(entity);
            }).then(function () {
                return newEntity;
            });
        },
        /** Save changes of foreign entity to the server */
        save: function () {
            var entity = this();
            return $.when(entity && this.view.saveEntity(entity));
        }
    };
});
