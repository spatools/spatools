/// <reference path="_data.d.ts" />

import mapping = require("./mapping");
import stores = require("./stores");
import context = require("./context");
import dataview = require("./dataview");
import adapters = require("./adapters");
import query = require("./query");
import guid = require("./guid");
import utils = require("../utils");

//#region Interfaces 

export interface DataSet extends KnockoutUnderscoreArrayFunctions, KnockoutUnderscoreObjectsFunctions, DataSetFunctions {
    (): {};

    setName: string;
    key: string;
    defaultType: string;
    context: context.DataContext;
    adapter: adapters.IAdapter;
    store: stores.IDataStore;

    localCount: KnockoutComputed<number>;
    remoteCount: KnockoutObservable<number>;
    realCount: KnockoutComputed<number>;

    isSynchronized: KnockoutComputed<boolean>;
}

export interface DataSetFunctions {
    /** Create a new view of the current set with specified query */
    createView<T>(query?: query.ODataQuery): dataview.DataView<T>;

    /** Refresh dataset from remote source */
    refresh(): JQueryPromise<any>;
    /** Query server to refresh dataset */
    query(query?: query.ODataQuery, refresh?: boolean);
    /** Load an entity by id from the remote source */
    load(key: any, query?: query.ODataQuery): JQueryPromise<any>;
    /** Execute action on remote source */
    executeAction(action: string, params?: any, entity?: any): JQueryPromise<any>;

    /** Add entity to dataset, if buffer is false, entity will be instantly post on the server */
    add(entity: any): JQueryPromise<any>;
    /** Add entities to dataset, if buffer is false, entities will be instantly post on the server */
    addRange(entities: any[]): JQueryPromise<any>;
    /** Update entity on dataset, if buffer is false, entity will be instantly put on the server */
    update(entity: any): void;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: any): void;

    /** Reset entity to its original state */
    resetEntity(entity: any): void;
    /** Dispose and clean entity */
    disposeEntity(entity: any): void;

    /** Get whether entity is attached or not */
    isAttached(entity: any): boolean;
    /** Attach an entity to the dataSet (commits immediately if buffer is false) */
    attach(entity: any): JQueryPromise<any>;
    /** Attach an Array of entities to the dataSet */
    attachRange(entities: any[]): JQueryPromise<any>;
    /** Stop an entity from being tracked by the dataSet */
    detach(entity: any): void;
    /** Stop an array of entities from being tracked by the dataSet */
    detachRange(entityKeys: any[]): void;
    /** Attach or update entity if existing with current data and commit changes if commit is set to true */
    attachOrUpdate(data: any, commit?: boolean): JQueryPromise<any>;
    /** Attach or update entities if existing with current data and commit changes if commit is set to true */
    attachOrUpdateRange(data: any[], commit?: boolean): JQueryPromise<any[]>;

    /** Gets the key associated with an entity */
    getKey(entity: any): any;
    /** Finds a matching entity in the set (by key) */
    findByEntity(entity: any): any;
    /** Finds a matching entity in the set (by key) */
    findByKey(key: any): any;

    /** Create a JS object from given entity */
    toJS(entity: any, keepstate?: boolean): any;
    /** Serialize given entity to JSON */
    toJSON(entity: any, keepstate?: boolean): string;

    /** Instanciate an entity from a JS object */
    fromJS(data: any, state?: mapping.entityStates): any;
    /** Instanciate an entity from a JSON string */
    fromJSON(json: string, state?: mapping.entityStates): any;

    /** Get a report of changes in the dataSet */
    getChanges(): any;
    /** Save changes of an entity to the server */
    saveEntity(entity): JQueryPromise<any>;
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges(): JQueryPromise<any>;

    createOnStateChanged(entity: any): (newState: mapping.entityStates) => void;

    /** Submits an Entity to the Server (internal use) */
    _remoteCreate(entity: any): JQueryPromise<any>;
    /** Updates an Item to the Server (internal use */
    _remoteUpdate(entity: any): JQueryPromise<any>;
    /** Deletes an Item from the Server (internal use) */
    _remoteRemove(entity: any): JQueryPromise<any>;
}

//#endregion

//#region Model

export function create(setName: string, keyPropertyName: string, defaultType: string, dataContext: context.DataContext): DataSet {
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
    result.count = ko.computed(() => result.remoteCount() === -1 ? result.localCount() : result.remoteCount());

    result.isSynchronized = ko.computed(() => result.localCount() === result.remoteCount());

    return result;
}

var dataSetFunctions: DataSetFunctions = {
    /** Create a new view of the current set with specified query */
    createView: function <T>(query?: query.ODataQuery): dataview.DataView<T> {
        return dataview.create<T>(this, query);
    },
    
    /** Refresh dataset from remote source */
    refresh: function (): JQueryPromise<any> {
        return this.query(null, true);
    },
    /** Query server to refresh dataset */
    query: function (query?: query.ODataQuery, refresh: boolean = false) {
        /// <summary>Query server to refresh dataset</summary>
        /// <param name="query" type="spa.odataQuery" optional="true">OData query for server</param>
        /// <param name="refresh" type="Boolean" optional="true" default="false">check whether local entities must be refreshed with new values</param>
        /// <returns type="$.Deffered">return a deffered object for async operations</returns>
        
        var self = this,
            count = -1;
        
        return this.adapter
            .getAll(self.setName, query)
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
                if (refresh === true) {
                    if (query && query.pageSize() === 0) {
                        var actual = query.applyFilters(self._toArray()),
                            report = utils.arrayCompare(actual, data);

                        self.detachRange(report.removed);
                    }

                    return self.attachOrUpdateRange(data);
                }
                else {
                    return _.map(data, self.fromJS, self);
                }
            })
            .done(function (result) {
                if (count !== -1)
                    self.remoteCount(count);
            });
    },
    /** Load an entity by id from the remote source */
    load: function (key: any, query?: query.ODataQuery): JQueryPromise<any> {
        var self = this;
        return this.adapter
            .getOne(this.setName, key, query)
            .then(function (data) { return self.attachOrUpdate(data); });
    },
    /** Execute action on remote source */
    executeAction: function (action: string, params?: any, entity?: any): JQueryPromise<any> {
        var id = entity ? this.getKey(entity) : null,
            data = ko.toJSON(params);

        if (!this.adapter.action)
            throw "This adapter is not compatible with custom actions";

        return this.adapter.action(this.setName, action, data, id);
    },

    /** Add entity to dataset, if buffer is false, entity will be instantly post on the server */
    add: function (entity: any): JQueryPromise<any> {
        if (!entity.EntityState)
            mapping.addMappingProperties(entity, this);

        entity.EntityState(mapping.entityStates.added);
        entity[this.key](guid.generateTemp());

        return this.attach(entity);
    },
    /** Add entities to dataset, if buffer is false, entities will be instantly post on the server */
    addRange: function (entities: any[]): JQueryPromise<any> {
        _.each(entities, function (entity) {
            if (!entity.EntityState)
                mapping.addMappingProperties(entity, this);

            entity.EntityState(mapping.entityStates.added);
            entity[this.key](guid.generateTemp());
        }, this);

        return this.attachRange(entities);
    },
    /** Update entity on dataset, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): void {
        if (this.isAttached(entity)) {
            entity.EntityState(mapping.entityStates.modified);
            this.store.update(this.setName, entity);
        }
    },
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove: function (entity: any): void {
        var state = entity.EntityState ? entity.EntityState() : null;
        if (!state || state === mapping.entityStates.added)
            this.detach(entity);
        else {
            entity.EntityState(mapping.entityStates.removed);
            this.store.update(this.setName, entity);
        }
    },

    /** Reset entity to its original state */
    resetEntity: function (entity: any): void {
        mapping.resetEntity(entity, this);
        this.store.update(this.setName, entity);
    },
    /** Dispose and clean entity */
    disposeEntity: function (entity: any): void {
        if (entity.subscription) {
            entity.subscription.dispose();
            delete entity.subscription;
        }
    },

    /** Get whether entity is attached or not */
    isAttached: function (entity: any): boolean {
        return !!this.findByEntity(entity);
    },
    /** Attach an entity to the dataSet (commits immediately if buffer is false) */
    attach: function (entity: any): JQueryPromise<any> {
        var self = this,
            key = this.getKey(entity),
            deferred;

        if (!this.isAttached(entity)) {
            this.valueWillMutate();

            this.store.add(this.setName, entity);

            if (this.context.buffer === false) {
                entity.EntityState.subscribe(this.createOnStateChanged(entity), this);
            }

            if (entity.EntityState() === mapping.entityStates.added) {
                if (this.context.buffer === false)
                    deferred = this._remoteCreate(entity);
            }
            else if (this.context.autoLazyLoading === true) {
                deferred = mapping.refreshRelations(entity, this).then(() => entity);
            }
        }

        return $.when(deferred || entity)
            .then(() => self.valueHasMutated())
            .then(() => entity);
    },
    /** Attach an Array of entities to the dataSet */
    attachRange: function (entities: any[]): JQueryPromise<any> {
        var self = this,
            toUpdate = false,
            deferreds = [];

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
                }
                else if (this.context.autoLazyLoading === true) {
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
    detach: function (entity: any): void {
        var key = this.getKey(entity);
        if (this.isAttached(entity)) {
            this.valueWillMutate();

            this.disposeEntity(entity);
            this.store.remove(this.setName, key);

            this.valueHasMutated();
        }
    },
    /** Stop an array of entities from being tracked by the dataSet */
    detachRange: function (entityKeys: any[]): void {
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
    attachOrUpdate: function (data: any, commit: boolean = false): JQueryPromise<any> {
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
    attachOrUpdateRange: function (data: any[], commit: boolean = false): JQueryPromise<any[]> {
        var toAttach = [], toUpdate = [],
            result = _.map(data, function (item) {
                var existing = this.findByEntity(item);

                if (!existing) {
                    var newEntity = this.fromJS(item, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged);
                    toAttach.push(newEntity);
                    return newEntity;
                }

                toUpdate.push(existing);
                return mapping.updateEntity(existing, item, commit, this);
            }, this);

        return $.when(this.store.updateRange(this.setName, toUpdate), this.attachRange(toAttach)).then(() => result);
    },

    /** Gets the key associated with an entity */
    getKey: function (entity: any): any {
        return ko.utils.unwrapObservable(entity[this.key]);
    },
    /** Finds a matching entity in the set (by key) */
    findByEntity: function (entity: any): any {
        var key = this.getKey(entity);
        return this.findByKey(key);
    },
    /** Finds a matching entity in the set (by key) */
    findByKey: function (key: any): any {
        return this.store.getOne(this.setName, key);
    },
    
    /** Create a JS object from given entity */
    toJS: function (entity: any, keepstate: boolean = false): any {
        return mapping.mapEntityToJS(entity, keepstate, this);
    },
    /** Serialize given entity to JSON */
    toJSON: function (entity: any, keepstate: boolean = false): string {
        return mapping.mapEntityToJSON(entity, keepstate, this);
    },

    /** Instanciate an entity from a JS object */
    fromJS: function (data: any, state?: mapping.entityStates): any {
        return mapping.mapEntityFromJS(data, state || mapping.entityStates.unchanged, this);
    },
    /** Instanciate an entity from a JSON string */
    fromJSON: function (json: string, state?: mapping.entityStates): any {
        return mapping.mapEntityFromJSON(json, state || mapping.entityStates.unchanged, this);
    },

    /** Get a report of changes in the dataSet */
    getChanges: function () {
        return _.groupBy(this.store.getAll(this.setName), (e) => e.EntityState());
    },
    /** Save changes of an entity to the server */
    saveEntity: function (entity: any): JQueryPromise<any> {
        var state = entity.EntityState(),
            states = mapping.entityStates;

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
    saveChanges: function (): JQueryPromise<any> {
        var changes = this.getChanges(),
            states = mapping.entityStates,
            deferreds = _.union(
                _.map(changes[states.added], e => this._remoteCreate(e)),
                _.map(changes[states.modified], e => this._remoteUpdate(e)),
                _.map(changes[states.removed], e => this._remoteRemove(e))
            );

        return $.when.apply($, deferreds);
    },

    createOnStateChanged: function (entity: any): (newState: mapping.entityStates) => void {
        var self = this;
        return function (newState: mapping.entityStates) {
            if (newState === mapping.entityStates.modified) {
                self.store.update(self.setName, entity);
                setTimeout(function () { self._remoteUpdate(entity); }, 0);
            }
            else if (newState === mapping.entityStates.removed) {
                setTimeout(function () { self._remoteRemove(entity); }, 100); //hack : updates before removes
            }
        };
    },

    /** Submits an Entity to the Server (internal use) */
    _remoteCreate: function (entity: any): JQueryPromise<any> {
        var self = this,
            oldkey = this.getKey(entity);

        if (entity.EntityState() === mapping.entityStates.added) {
            if (entity.IsSubmitting() === false) {
                entity.IsSubmitting(true);

                return this.adapter
                    .post(this.setName, this.toJSON(entity), oldkey)
                    .then(function (data) {
                        mapping.updateEntity(entity, data, false, self);
                    })
                    .then(function () {
                        if (oldkey != self.getKey(entity)) {
                            self.valueWillMutate();

                            self.store.remove(self.setName, oldkey);
                            self.store.add(self.setName, entity);

                            self.valueHasMutated();
                        }
                    })
                    .then(function () {
                        if (self.context.autoLazyLoading === true)
                            return mapping.refreshRelations(entity, self);
                    })
                    .then(function () { return entity; })
                    .always(function () { entity.IsSubmitting(false); });
            }
        }

        return $.when(entity);
    },
    /** Updates an Item to the Server (internal use */
    _remoteUpdate: function (entity: any): JQueryPromise<any> {
        var self = this,
            key = this.getKey(entity);

        if (entity.IsSubmitting() === false) {
            entity.IsSubmitting(true);

            return this.adapter
                .put(this.setName, key, this.toJSON(entity))
                .then(function (data) {
                    mapping.updateEntity(entity, data, false, self);
                    return entity;
                })
                .always(function () { entity.IsSubmitting(false); });
        }

        return $.when();
    },
    /** Deletes an Item from the Server (internal use) */
    _remoteRemove: function (entity: any): JQueryPromise<any> {
        var self = this,
            key = this.getKey(entity);

        if (entity.IsSubmitting() === false) {
            entity.IsSubmitting(true);

            return this.adapter
                .remove(this.setName, key)
                .then(function () {
                    self.detach(entity);
                    return entity;
                })
                .always(function () { entity.IsSubmitting(false); });
        }

        return $.when();
    }
};

ko.utils.extend(dataSetFunctions, spa.underscore.objects);
ko.utils.extend(dataSetFunctions, spa.underscore.collections);

//#endregion