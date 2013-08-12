define(["require", "exports", "./mapping", "./dataview", "./guid", "../utils"], function(require, exports, __mapping__, __dataview__, __guid__, __utils__) {
    /// <reference path="_data.d.ts" />
    var mapping = __mapping__;
    
    
    var dataview = __dataview__;
    
    
    var guid = __guid__;
    var utils = __utils__;

    //#endregion
    //#region Model
    function create(setName, keyPropertyName, defaultType, dataContext) {
        var result = ko.observable(dataContext.store.getMemorySet(setName)).extend({ notify: "reference" });

        result.setName = setName;
        result.key = keyPropertyName;
        result.defaultType = defaultType;
        result.context = dataContext;
        result.adapter = dataContext.adapter;
        result.store = dataContext.store;

        ko.utils.extend(result, dataSetFunctions);

        result.localCount = result.size();
        result.remoteCount = ko.observable(-1);
        result.count = ko.computed(function () {
            return result.remoteCount() === -1 ? result.localCount() : result.remoteCount();
        });

        result.isSynchronized = ko.computed(function () {
            return result.localCount() === result.remoteCount();
        });

        return result;
    }
    exports.create = create;

    var dataSetFunctions = {
        /** Create a new view of the current set with specified query */
        createView: function (query) {
            return dataview.create(this, query);
        },
        /** Refresh dataset from remote source */
        refresh: function () {
            return this.query(null, true);
        },
        /** Query server to refresh dataset */
        query: function (query, refresh) {
            if (typeof refresh === "undefined") { refresh = false; }
            /// <summary>Query server to refresh dataset</summary>
            /// <param name="query" type="spa.odataQuery" optional="true">OData query for server</param>
            /// <param name="refresh" type="Boolean" optional="true" default="false">check whether local entities must be refreshed with new values</param>
            /// <returns type="$.Deffered">return a deffered object for async operations</returns>
            var self = this, count = -1;

            return this.adapter.getAll(self.setName, query).then(function (data) {
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
                if (refresh === true) {
                    if (query && query.pageSize() === 0) {
                        var actual = query.applyFilters(self._toArray()), report = utils.arrayCompare(actual, data);

                        self.detachRange(report.removed);
                    }

                    return self.attachOrUpdateRange(data);
                } else {
                    return _.map(data, self.fromJS, self);
                }
            }).done(function (result) {
                if (count !== -1)
                    self.remoteCount(count);
            });
        },
        /** Load an entity by id from the remote source */
        load: function (key) {
            var self = this;
            return this.adapter.getOne(this.setName, key).then(function (data) {
                return self.attachOrUpdate(data);
            });
        },
        /** Execute action on remote source */
        executeAction: function (action, params, entity) {
            var id = entity ? this.getKey(entity) : null, data = ko.toJSON(params);

            if (!this.adapter.action)
                throw "This adapter is not compatible with custom actions";

            return this.adapter.action(this.setName, action, data, id);
        },
        /** Add entity to dataset, if buffer is false, entity will be instantly post on the server */
        add: function (entity) {
            if (!entity.EntityState)
                mapping.addMappingProperties(entity, this);

            entity.EntityState(mapping.entityStates.added);
            entity[this.key](guid.generateTemp());

            return this.attach(entity);
        },
        /** Add entities to dataset, if buffer is false, entities will be instantly post on the server */
        addRange: function (entities) {
            _.each(entities, function (entity) {
                if (!entity.EntityState)
                    mapping.addMappingProperties(entity, this);

                entity.EntityState(mapping.entityStates.added);
                entity[this.key](guid.generateTemp());
            }, this);

            return this.attachRange(entities);
        },
        /** Update entity on dataset, if buffer is false, entity will be instantly put on the server */
        update: function (entity) {
            if (this.isAttached(entity)) {
                entity.EntityState(mapping.entityStates.modified);
                this.store.update(this.setName, entity);
            }
        },
        /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
        remove: function (entity) {
            var state = entity.EntityState ? entity.EntityState() : null;
            if (!state || state === mapping.entityStates.added)
                this.detach(entity); else {
                entity.EntityState(mapping.entityStates.removed);
                this.store.update(this.setName, entity);
            }
        },
        /** Reset entity to its original state */
        resetEntity: function (entity) {
            mapping.resetEntity(entity, this);
            this.store.update(this.setName, entity);
        },
        /** Dispose and clean entity */
        disposeEntity: function (entity) {
            if (entity.subscription) {
                entity.subscription.dispose();
                delete entity.subscription;
            }
        },
        /** Get whether entity is attached or not */
        isAttached: function (entity) {
            return !!this.findByEntity(entity);
        },
        /** Attach an entity to the dataSet (commits immediately if buffer is false) */
        attach: function (entity) {
            var self = this, key = this.getKey(entity), deferred;

            if (!this.isAttached(entity)) {
                this.valueWillMutate();

                this.store.add(this.setName, entity);

                if (this.context.buffer === false) {
                    entity.EntityState.subscribe(this.createOnStateChanged(entity), this);
                }

                if (entity.EntityState() === mapping.entityStates.added) {
                    if (this.context.buffer === false)
                        deferred = this._remoteCreate(entity);
                } else if (this.context.autoLazyLoading === true) {
                    deferred = mapping.refreshRelations(entity, this).then(function () {
                        return entity;
                    });
                }
            }

            return $.when(deferred || entity).then(function () {
                return self.valueHasMutated();
            }).then(function () {
                return entity;
            });
        },
        /** Attach an Array of entities to the dataSet */
        attachRange: function (entities) {
            var self = this, toUpdate = false, deferreds = [];

            var toStore = _.filter(entities, function (entity) {
                if (!this.isAttached(entity)) {
                    if (!toUpdate) {
                        this.valueWillMutate();
                        toUpdate = true;
                    }

                    if (this.context.buffer === false) {
                        entity.EntityState.subscribe(this.createOnStateChanged(entity), this);
                    }

                    if (entity.EntityState() === mapping.entityStates.added) {
                        if (this.context.buffer === false) {
                            deferreds.push(this._remoteCreate(entity));
                        }
                    } else if (this.context.autoLazyLoading === true) {
                        deferreds.push(mapping.refreshRelations(entity, this));
                    }

                    return true;
                }

                return false;
            }, this);

            if (toUpdate) {
                this.store.addRange(this.setName, toStore);
                this.valueHasMutated();
            }

            return $.when.apply($, deferreds);
        },
        /** Stop an entity from being tracked by the dataSet */
        detach: function (entity) {
            var key = this.getKey(entity);
            if (this.isAttached(entity)) {
                this.valueWillMutate();

                this.disposeEntity(entity);
                this.store.remove(this.setName, key);

                this.valueHasMutated();
            }
        },
        /** Stop an array of entities from being tracked by the dataSet */
        detachRange: function (entityKeys) {
            var toUpdate = false;

            var toRemove = _.filter(entityKeys, function (key) {
                var entity = this.findByKey(key);
                if (entity) {
                    if (!toUpdate) {
                        this.valueWillMutate();
                        toUpdate = true;
                    }

                    this.disposeEntity(entity);
                    return true;
                }

                return false;
            }, this);

            if (toUpdate) {
                this.store.removeRange(this.setName, toRemove);
                this.valueHasMutated();
            }
        },
        /** Attach or update entity if existing with current data and commit changes if commit is set to true */
        attachOrUpdate: function (data, commit) {
            if (typeof commit === "undefined") { commit = false; }
            var existing = this.findByEntity(data);

            if (!existing) {
                var newEntity = this.fromJS(data, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged);
                return this.attach(newEntity);
            }

            mapping.updateEntity(existing, data, commit, this);
            this.store.update(this.setName, existing);

            return $.when(existing);
        },
        /** Attach or update entities if existing with current data and commit changes if commit is set to true */
        attachOrUpdateRange: function (data, commit) {
            if (typeof commit === "undefined") { commit = false; }
            var toAttach = [], toUpdate = [], result = _.map(data, function (item) {
                var existing = this.findByEntity(item);

                if (!existing) {
                    var newEntity = this.fromJS(item, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged);
                    toAttach.push(newEntity);
                    return newEntity;
                }

                toUpdate.push(existing);
                return mapping.updateEntity(existing, item, commit, this);
            }, this);

            return $.when(this.store.updateRange(this.setName, toUpdate), this.attachRange(toAttach)).then(function () {
                return result;
            });
        },
        /** Gets the key associated with an entity */
        getKey: function (entity) {
            return ko.utils.unwrapObservable(entity[this.key]);
        },
        /** Finds a matching entity in the set (by key) */
        findByEntity: function (entity) {
            var key = this.getKey(entity);
            return this.findByKey(key);
        },
        /** Finds a matching entity in the set (by key) */
        findByKey: function (key) {
            return this.store.getOne(this.setName, key);
        },
        /** Create a JS object from given entity */
        toJS: function (entity, keepstate) {
            if (typeof keepstate === "undefined") { keepstate = false; }
            return mapping.mapEntityToJS(entity, keepstate, this);
        },
        /** Serialize given entity to JSON */
        toJSON: function (entity, keepstate) {
            if (typeof keepstate === "undefined") { keepstate = false; }
            return mapping.mapEntityToJSON(entity, keepstate, this);
        },
        /** Instanciate an entity from a JS object */
        fromJS: function (data, state) {
            return mapping.mapEntityFromJS(data, state || mapping.entityStates.unchanged, this);
        },
        /** Instanciate an entity from a JSON string */
        fromJSON: function (json, state) {
            return mapping.mapEntityFromJSON(json, state || mapping.entityStates.unchanged, this);
        },
        /** Get a report of changes in the dataSet */
        getChanges: function () {
            return _.groupBy(this.store.getAll(this.setName), function (e) {
                return e.EntityState();
            });
        },
        /** Save changes of an entity to the server */
        saveEntity: function (entity) {
            var state = entity.EntityState(), states = mapping.entityStates;

            switch (state) {
                case states.added:
                    return this._remoteCreate(entity);
                case states.modified:
                    return this._remoteUpdate(entity);
                case states.removed:
                    return this._remoteRemove(entity);
            }

            return $.when();
        },
        /** Commits all Pending Operations (PUT, DELETE, POST) */
        saveChanges: function () {
            var changes = this.getChanges(), self = this, deferreds = [];

            _.each(changes.added, function (e) {
                deferreds.push(self._remoteCreate(e));
            });
            _.each(changes.modified, function (e) {
                deferreds.push(self._remoteUpdate(e));
            });
            _.each(changes.removed, function (e) {
                deferreds.push(self._remoteRemove(e));
            });

            return $.when.apply($, deferreds);
        },
        createOnStateChanged: function (entity) {
            var self = this;
            return function (newState) {
                if (newState === mapping.entityStates.modified) {
                    self.store.update(self.setName, entity);
                    setTimeout(function () {
                        self._remoteUpdate(entity);
                    }, 0);
                } else if (newState === mapping.entityStates.removed) {
                    setTimeout(function () {
                        self._remoteRemove(entity);
                    }, 100);
                }
            };
        },
        /** Submits an Entity to the Server (internal use) */
        _remoteCreate: function (entity) {
            var self = this, oldkey = this.getKey(entity);

            if (entity.EntityState() === mapping.entityStates.added) {
                if (entity.IsSubmitting() === false) {
                    entity.IsSubmitting(true);

                    return this.adapter.post(this.setName, this.toJSON(entity), oldkey).then(function (data) {
                        mapping.updateEntity(entity, data, false, self);
                    }).then(function () {
                        if (oldkey != self.getKey(entity)) {
                            self.valueWillMutate();

                            self.store.remove(self.setName, oldkey);
                            self.store.add(self.setName, entity);

                            self.valueHasMutated();
                        }
                    }).then(function () {
                        if (self.context.autoLazyLoading === true)
                            return mapping.refreshRelations(entity, self);
                    }).then(function () {
                        return entity;
                    }).always(function () {
                        entity.IsSubmitting(false);
                    });
                }
            }

            return $.when(entity);
        },
        /** Updates an Item to the Server (internal use */
        _remoteUpdate: function (entity) {
            var self = this, key = this.getKey(entity);

            if (entity.IsSubmitting() === false) {
                entity.IsSubmitting(true);

                return this.adapter.put(this.setName, key, this.toJSON(entity)).then(function (data) {
                    mapping.updateEntity(entity, data, false, self);
                    return entity;
                }).always(function () {
                    entity.IsSubmitting(false);
                });
            }

            return $.when();
        },
        /** Deletes an Item from the Server (internal use) */
        _remoteRemove: function (entity) {
            var self = this, key = this.getKey(entity);

            if (entity.IsSubmitting() === false) {
                entity.IsSubmitting(true);

                return this.adapter.remove(this.setName, key).then(function () {
                    self.detach(entity);
                    return entity;
                }).always(function () {
                    entity.IsSubmitting(false);
                });
            }

            return $.when();
        }
    };

    ko.utils.extend(dataSetFunctions, spa.underscore.objects);
    ko.utils.extend(dataSetFunctions, spa.underscore.collections);
});
