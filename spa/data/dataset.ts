/// <reference path="_data.d.ts" />

import mapping = require("./mapping");
import stores = require("./stores");
import context = require("./context");
import dataview = require("./dataview");
import adapters = require("./adapters");
import query = require("./query");
import guid = require("./guid");
import underscore = require("../underscore");
import utils = require("../utils");

//#region Interfaces 

export interface DataSet<T, TKey> extends KnockoutUnderscoreArrayFunctions<T> { }
export interface DataSet<T, TKey> extends KnockoutUnderscoreObjectsFunctions<T> { }
export interface DataSet<T, TKey> extends KnockoutObservable<any> { }
export interface DataSet<T, TKey> extends DataSetFunctions<T, TKey> {
    setName: string;
    key: string;
    defaultType: string;
    context: context.DataContext;
    adapter: adapters.IAdapter;
    localstore: stores.IDataStore;
    refreshMode: string;

    localCount: KnockoutComputed<number>;
    remoteCount: KnockoutObservable<number>;
    realCount: KnockoutComputed<number>;

    isSynchronized: KnockoutComputed<boolean>;
}

export interface DataSetFunctions<T, TKey> {
    /** Change local store */
    setLocalStore(store: stores.IDataStore): void;
    /** Change remote adapter */
    setAdapter(adapter: adapters.IAdapter): void;
    /** Reset this dataset by detaching all entities */
    reset(): void;

    /** Create a new view of the current set with specified query */
    createView(): dataview.DataView<T, TKey>;
    createView(query: query.ODataQuery): dataview.DataView<T, TKey>;

    /** Refresh dataset from remote source */
    refresh(): JQueryPromise<T[]>;
    refresh(query: query.ODataQuery): JQueryPromise<T[]>;
    refresh(mode: string): JQueryPromise<T[]>;
    refresh(mode: string, query: query.ODataQuery): JQueryPromise<T[]>;

    /** Query server to refresh dataset */
    query(): JQueryPromise<T[]>;
    query(query: query.ODataQuery): JQueryPromise<T[]>;
    query(mode: string): JQueryPromise<T[]>;
    query(mode: string, query: query.ODataQuery): JQueryPromise<T[]>;

    /** Load an entity by id from the remote source */
    load(key: TKey): JQueryPromise<T>;
    load(key: TKey, query: query.ODataQuery): JQueryPromise<T>;
    load(key: TKey, mode: string): JQueryPromise<T>;
    load(key: TKey, mode: string, query: query.ODataQuery): JQueryPromise<T>;

    /** Synchronize data store with remote source content */
    sync(): JQueryPromise<void>;
    sync(query: query.ODataQuery): JQueryPromise<void>;

    /** Get relation by ensuring using specific remote action and not filter */
    refreshRelation<U>(entity: T, propertyName: string): JQueryPromise<U>;
    refreshRelation<U>(entity: T, propertyName: string, query: query.ODataQuery): JQueryPromise<U>;
    refreshRelation<U>(entity: T, propertyName: string, mode: string): JQueryPromise<U>;
    refreshRelation<U>(entity: T, propertyName: string, mode: string, query: query.ODataQuery): JQueryPromise<U>;

    /** Execute action on remote source */
    executeAction(action: string, params?: any, entity?: T): JQueryPromise<any>;

    /** Gets the key associated with an entity */
    getKey(entity: T): TKey;
    /** Finds a matching entity in the set (by key) */
    findByKey(key: TKey): T;

    /** Add entity to dataset, if buffer is false, entity will be instantly post on the server */
    add(entity: T): JQueryPromise<T>;
    /** Add entities to dataset, if buffer is false, entities will be instantly post on the server */
    addRange(entities: T[]): JQueryPromise<T[]>;
    /** Update entity on dataset, if buffer is false, entity will be instantly put on the server */
    update(entity: T): JQueryPromise<T>;
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove(entity: T): JQueryPromise<T>;

    /** Reset entity to its original state */
    resetEntity(entity: T): JQueryPromise<any>;
    /** Dispose and clean entity */
    disposeEntity(entity: T): void;

    /** Get whether entity is attached or not */
    isAttached(entity: T): boolean;

    /** Attach an entity to the dataSet (commits immediately if buffer is false) */
    attach(entity: T): JQueryPromise<T>;
    attach(entity: T, store: boolean): JQueryPromise<T>;
    /** Attach an Array of entities to the dataSet */
    attachRange(entities: T[]): JQueryPromise<T[]>;
    attachRange(entities: T[], store: boolean): JQueryPromise<T[]>;
    /** Stop an entity from being tracked by the dataSet */

    detach(entity: T): void;
    /** Stop an array of entities from being tracked by the dataSet */
    detachRange(entityKeys: TKey[]): void;

    /** Attach or update entity if existing with current data and commit changes if commit is set to true */
    attachOrUpdate(data: any): JQueryPromise<T>;
    attachOrUpdate(data: any, commit: boolean): JQueryPromise<T>;
    attachOrUpdate(data: any, commit: boolean, expand: boolean): JQueryPromise<T>;
    attachOrUpdate(data: any, commit: boolean, expand: boolean, store: boolean): JQueryPromise<T>;

    /** Attach or update entities if existing with current data and commit changes if commit is set to true */
    attachOrUpdateRange(data: any): JQueryPromise<T>;
    attachOrUpdateRange(data: any, commit: boolean): JQueryPromise<T>;
    attachOrUpdateRange(data: any, commit: boolean, expand: boolean): JQueryPromise<T>;
    attachOrUpdateRange(data: any, commit: boolean, expand: boolean, store: boolean): JQueryPromise<T>;

    /** Store entity to local store without attaching to datacontext */
    store(entity: any): JQueryPromise<any>;
    /** Store entities to local store without attaching to datacontext */
    storeRange(entities: any[]): JQueryPromise<any[]>;

    /** Create a JS object from given entity */
    toJS(entity: T): any;
    toJS(entity: T, keepstate: boolean): any;
    /** Serialize given entity to JSON */
    toJSON(entity: T): string;
    toJSON(entity: T, keepstate: boolean): string;

    /** Instanciate entities from a JS array */
    fromJSRange(data: any[]): JQueryPromise<T[]>;
    fromJSRange(data: any[], state: mapping.entityStates): JQueryPromise<T[]>;
    fromJSRange(data: any[], state: mapping.entityStates, expand: boolean): JQueryPromise<T[]>;
    fromJSRange(data: any[], state: mapping.entityStates, expand: boolean, store: boolean): JQueryPromise<T[]>;
    /** Instanciate an entity from a JS object */
    fromJS(data: any): JQueryPromise<T>;
    fromJS(data: any, state: mapping.entityStates): JQueryPromise<T>;
    fromJS(data: any, state: mapping.entityStates, expand: boolean): JQueryPromise<T>;
    fromJS(data: any, state: mapping.entityStates, expand: boolean, store: boolean): JQueryPromise<T>;
    /** Instanciate an entity from a JSON string */
    fromJSON(json: string): T;
    fromJSON(json: string, state: mapping.entityStates): JQueryPromise<T>;
    fromJSON(json: string, state: mapping.entityStates, expand: boolean): JQueryPromise<T>;
    fromJSON(json: string, state: mapping.entityStates, expand: boolean, store: boolean): JQueryPromise<T>;

    /** Get a report of changes in the dataSet */
    getChanges(): any;
    /** Save changes of an entity to the server */
    saveEntity(entity: T): JQueryPromise<T>;
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges(): JQueryPromise<any>;

    /** Submits an Entity to the Server (internal use) */
    _remoteCreate(entity: T): JQueryPromise<T>;
    /** Updates an Item to the Server (internal use */
    _remoteUpdate(entity: T): JQueryPromise<T>;
    /** Deletes an Item from the Server (internal use) */
    _remoteRemove(entity: T): JQueryPromise<T>;
}

//#endregion

//#region Private Methods

function _createOnStateChanged(dataset: DataSet<any, any>, entity: any): (newState: mapping.entityStates) => void {
    return (newState: mapping.entityStates) => {
        if (newState === mapping.entityStates.modified) {
            utils.timeout().then(() => {
                dataset.store(entity);
                dataset._remoteUpdate(entity);
            });
        }
        else if (newState === mapping.entityStates.removed) {
            utils.timeout(100).then(() => dataset._remoteRemove(entity)); //hack : updates before removes
        }
    };
}

function _initAttachedEntity(dataset: DataSet<any, any>, entity: any): any {
    if (dataset.context.buffer === false) {
        entity.EntityState.subscribe(_createOnStateChanged(dataset, entity));
    }

    if (entity.EntityState() === mapping.entityStates.added) {
        if (dataset.context.buffer === false)
            return dataset._remoteCreate(entity);
    }
    else if (dataset.context.autoLazyLoading === true) {
        return mapping.refreshRelations(entity, dataset).then(() => entity);
    }

    return entity;
}

function _updateDataSet(dataset: DataSet<any, any>, result: adapters.IAdapterResult, query: query.ODataQuery): JQueryPromise<any[]> {
    var rmDfd, isArray = _.isArray(result.data);
    if (isArray && !query || query.pageSize() === 0) {
        var current = dataset.toArray();
        if (query && query.filters.size() > 0)
            current = query.applyFilters(current);

        var report = utils.arrayCompare(
            _.map(current, dataset.getKey, dataset),
            _.map(result.data, dataset.getKey, dataset)
        );

        if (report.removed.length > 0) {
            rmDfd = dataset.localstore.removeRange(dataset.setName, report.removed)
                .then(() => dataset.detachRange(report.removed));
        }
    }

    return $.when(rmDfd).then(() => {
        if (result.count >= 0 && (!query || query.filters.size() === 0))
            dataset.remoteCount(result.count);

        return isArray ?
            dataset.attachOrUpdateRange(result.data, false, !!query && query.expands.size() > 0) :
            dataset.attachOrUpdate(result.data, false, !!query && query.expands.size() > 0);
    });
}

//#endregion

//#region Model

export function create<T, TKey>(setName: string, keyPropertyName: string, defaultType: string, dataContext: context.DataContext): DataSet<T, TKey> {
    var result = ko.observable({}).extend({ notify: "reference" });

    result.setName = setName;
    result.key = keyPropertyName;
    result.defaultType = defaultType;
    result.context = dataContext;
    result.adapter = dataContext.adapter;
    result.localstore = dataContext.store;
    result.refreshMode = dataContext.refreshMode;

    ko.utils.extend(result, dataSetFunctions);

    result.localCount = result._size();
    result.remoteCount = ko.observable(-1);
    result.count = ko.computed(() => result.remoteCount() === -1 ? result.localCount() : result.remoteCount());

    result.isSynchronized = ko.computed(() => result.localCount() === result.remoteCount());

    return result;
}

var dataSetFunctions: DataSetFunctions<any, any> = {
    /** Change local store */
    setLocalStore: function (store: stores.IDataStore): void {
        this.localstore = store;
        this.reset();
    },
    /** Change remote adapter */
    setAdapter: function (adapter: adapters.IAdapter): void {
        this.adapter = adapter;
    },

    /** Reset this dataset by detaching all entities */
    reset: function () {
        this.each(this.disposeEntity, this);
        this({});
    },

    /** Create a new view of the current set with specified query */
    createView: function (query?: query.ODataQuery): dataview.DataView<any, any> {
        return dataview.create(this, query);
    },

    /** Query remote source without attaching result to dataset */
    query: function (mode?: any, query?: query.ODataQuery): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this,
            dfd: JQueryPromise<any[]>;

        if (!mode) mode = self.refreshMode;
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = self.refreshMode;
        }

        if (mode === "remote") {
            dfd = self.adapter.getAll(self.setName, query).then(result => result.data);
        }
        else {
            dfd = self.localstore.getAll(self.setName, query);
        }

        return dfd.then(data => self.fromJSRange(data, null, !!query && query.expands.size() > 0, false));
    },

    /** Refresh dataset from remote source */
    refresh: function (mode?: any, query?: query.ODataQuery): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this;
        if (!mode) mode = self.refreshMode;
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = self.refreshMode;
        }

        if (mode === "remote") {
            return self.adapter.getAll(self.setName, query)
                .then(result => _updateDataSet(self, result, query));
        }
        else {
            return self.localstore.getAll(self.setName, query)
                .then(entities => self.attachOrUpdateRange(entities, false, !!query && query.expands.size() > 0, false));
        }
    },
    /** Load an entity by id from the remote source */
    load: function (key: any, mode?: any, query?: query.ODataQuery): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            dfd: JQueryPromise<any>;

        if (!mode) mode = self.refreshMode;
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = self.refreshMode;
        }

        if (mode === "remote") {
            dfd = self.adapter.getOne(self.setName, key, query);
        }
        else {
            dfd = self.localstore.getOne(self.setName, key, query);
        }

        return dfd.then(data => self.attachOrUpdate(data, false, !!query && query.expands.size() > 0, mode === "remote"));
    },

    /** Synchronize data store with remote source content */
    sync: function (query?: query.ODataQuery): JQueryPromise<void> {
        var self = <DataSet<any, any>>this;
        return self.adapter.getAll(self.setName, query)
            .then(result => self.storeRange(result.data));
    },

    /** Get relation by ensuring using specific remote action and not filter */
    refreshRelation: function (entity: any, propertyName: string, mode?: any, query?: query.ODataQuery): JQueryPromise<any[]> {
        if (!this.adapter.getRelation) {
            throw new Error("This adapter does not support custom relations");
        }

        if (!mode) mode = self.refreshMode;
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = "remote";
        }

        var self = <DataSet<any, any>>this,
            config = mapping.getMappingConfiguration(entity, self),
            relation = _.find(config.relations, r => r.propertyName === propertyName);

        if (!relation) {
            throw new Error("This relation is not configured on this entity type");
        }

        var foreignSet = self.context.getSet(relation.controllerName);
        if (mode === "remote") {
            return self.adapter.getRelation(self.setName, propertyName, self.getKey(entity), query)
                .then(result => _updateDataSet(foreignSet, result, query));
        }
        else {
            return self.localstore.getAll(foreignSet.setName, query)
                .then(entities => foreignSet.attachOrUpdateRange(entities, false, !!query && query.expands.size() > 0, false));
        }
    },

    /** Execute action on remote source */
    executeAction: function (action: string, params?: any, entity?: any): JQueryPromise<any> {
        if (!this.adapter.action) {
            throw new Error("This adapter does not support custom actions");
        }

        var id = entity ? this.getKey(entity) : null,
            data = ko.toJSON(params);

        return this.adapter.action(this.setName, action, data, id);
    },

    /** Gets the key associated with an entity */
    getKey: function (entity: any): any {
        return ko.unwrap(entity[this.key]);
    },
    /** Finds a matching entity in the set (by key) */
    findByKey: function (key: any): any {
        return this()[key];
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
        _.each(entities, entity => {
            if (!entity.EntityState)
                mapping.addMappingProperties(entity, this);

            entity.EntityState(mapping.entityStates.added);
            entity[this.key](guid.generateTemp());
        });

        return this.attachRange(entities);
    },
    /** Update entity on dataset, if buffer is false, entity will be instantly put on the server */
    update: function (entity: any): JQueryPromise<any> {
        if (this.isAttached(entity)) {
            entity.EntityState(mapping.entityStates.modified);
            return this.store(entity);
        }

        return $.when(entity);
    },
    /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
    remove: function (entity: any): JQueryPromise<any> {
        var state = entity.EntityState && entity.EntityState();
        if (utils.isUndefined(state) || state === mapping.entityStates.added)
            this.detach(entity);
        else {
            entity.EntityState(mapping.entityStates.removed);
            return this.store(entity);
        }

        return $.when(entity);
    },

    /** Reset entity to its original state */
    resetEntity: function (entity: any): JQueryPromise<any> {
        mapping.resetEntity(entity, this);
        return this.store(entity);
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
        return !!this.findByKey(this.getKey(entity));
    },
    /** Attach an entity to the dataSet (commits immediately if buffer is false) */
    attach: function (entity: any, store: boolean = true): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            table = self(),
            key = self.getKey(entity);

        if (!self.isAttached(entity)) {
            self.valueWillMutate();

            return $.when(store && self.localstore.add(self.setName, entity))
                .then(() => {
                    table[key] = entity;
                    return _initAttachedEntity(self, entity);
                })
                .then(() => self.valueHasMutated())
                .then(() => entity);
        }

        return $.when(entity);
    },
    /** Attach an Array of entities to the dataSet */
    attachRange: function (entities: any[], store: boolean = true): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this,
            toUpdate = false,
            table = self(),
            key, dfds = [];

        var toStore = _.filter(entities, entity => {
            if (!self.isAttached(entity)) {
                if (!toUpdate) {
                    self.valueWillMutate();
                    toUpdate = true;
                }

                key = self.getKey(entity);
                table[key] = entity;

                dfds.push(_initAttachedEntity(self, entity));

                return true;
            }

            return false;
        });

        return utils.whenAll(dfds)
            .then(() => toUpdate && store && self.localstore.addRange(self.setName, toStore))
            .then(() => toUpdate && self.valueHasMutated())
            .then(() => entities);
    },

    /** Stop an entity from being tracked by the dataSet */
    detach: function (entity: any): void {
        var self = <DataSet<any, any>>this,
            table = self(),
            key = this.getKey(entity);

        if (self.isAttached(entity)) {
            self.valueWillMutate();

            self.disposeEntity(entity);
            delete table[key];

            self.valueHasMutated();
        }
    },
    /** Stop an array of entities from being tracked by the dataSet */
    detachRange: function (entityKeys: any[]): void {
        var self = <DataSet<any, any>>this,
            table = self(),
            toUpdate = false;

        _.each(entityKeys, key => {
            var entity = self.findByKey(key);
            if (entity) {
                if (!toUpdate) {
                    self.valueWillMutate();
                    toUpdate = true;
                }

                self.disposeEntity(entity);
                delete table[key];
            }
        });

        if (toUpdate) {
            self.valueHasMutated();
        }
    },

    /** Attach or update entity if existing with current data and commit changes if commit is set to true */
    attachOrUpdate: function (data: any, commit: boolean = false, expand: boolean = false, store: boolean = true): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            existing = self.findByKey(self.getKey(data));

        if (!existing) {
            return self.fromJS(data, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged, expand, store)
                .then(entity => self.attach(entity, store));
        }

        return mapping.updateEntity(existing, data, commit, expand, store, self)
            .then(() => store && self.store(existing))
            .then(() => existing);
    },
    /** Attach or update entities if existing with current data and commit changes if commit is set to true */
    attachOrUpdateRange: function (data: any[], commit: boolean = false, expand: boolean = false, store: boolean = true): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this,
            toAttach = [], toUpdateData = [], toUpdate = [];

        _.each(data, item => {
            var existing = self.findByKey(self.getKey(item));
            if (existing) {
                toUpdateData.push(item);
                toUpdate.push(existing);
            }
            else {
                toAttach.push(item);
            }
        });

        return mapping.updateEntities(toUpdate, toUpdateData, commit, expand, store, self)
            .then(result => {
                toUpdate = result;

                if (store)
                    return self.storeRange(result);
            })
            .then(() => self.fromJSRange(toAttach, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged, expand, store))
            .then((result: any[]) => {
                toAttach = result;
                return self.attachRange(result, store);
            })
            .then(() => _.union(toAttach, toUpdate));

        //return self.fromJSRange(toAttach, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged, expand, store).then(result => { toAttach = result; })
        //    .then(() => mapping.updateEntities(toUpdate, toUpdateData, commit, expand, store, self)).then(result => { toUpdate = result; })
        //    .then(() => store && self.storeRange(toUpdate))
        //    .then(() => self.attachRange(toAttach, store))
        //    .then(() => _.union(toAttach, toUpdate));
    },

    /** Store entity to local store without attaching to datacontext */
    store: function (entity: any): JQueryPromise<any> {
        if (_.isUndefined(entity.EntityState))
            entity.EntityState = mapping.entityStates.unchanged;

        return this.localstore.update(this.setName, entity).then(() => entity);
    },
    /** Store entities to local store without attaching to datacontext */
    storeRange: function (entities: any[]): JQueryPromise<any[]> {
        _.each(entities, entity => {
            if (_.isUndefined(entity.EntityState))
                entity.EntityState = mapping.entityStates.unchanged;
        });

        return this.localstore.updateRange(this.setName, entities).then(() => entities);
    },

    /** Create a JS object from given entity */
    toJS: function (entity: any, keepstate: boolean = false): any {
        return mapping.mapEntityToJS(entity, keepstate, this);
    },
    /** Serialize given entity to JSON */
    toJSON: function (entity: any, keepstate: boolean = false): string {
        return mapping.mapEntityToJSON(entity, keepstate, this);
    },

    /** Instanciate an entities from a JS array */
    fromJSRange: function (data: any, state?: mapping.entityStates, expand: boolean = true, store: boolean = true): JQueryPromise<any> {
        return mapping.mapEntitiesFromJS(data, state || mapping.entityStates.unchanged, expand, store, this);
    },
    /** Instanciate an entity from a JS object */
    fromJS: function (data: any, state?: mapping.entityStates, expand: boolean = true, store: boolean = true): JQueryPromise<any> {
        return mapping.mapEntityFromJS(data, state || mapping.entityStates.unchanged, expand, store, this);
    },
    /** Instanciate an entity from a JSON string */
    fromJSON: function (json: string, state?: mapping.entityStates, expand: boolean = true, store: boolean = true): JQueryPromise<any> {
        return mapping.mapEntityFromJSON(json, state || mapping.entityStates.unchanged, expand, store, this);
    },

    /** Get a report of changes in the dataSet */
    getChanges: function () {
        return (<DataSet<any, any>>this).groupBy(e => e.EntityState());
    },
    /** Save changes of an entity to the server */
    saveEntity: function (entity: any): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            state = entity.EntityState(),
            states = mapping.entityStates;

        switch (state) {
            case states.added:
                return self._remoteCreate(entity);
            case states.modified:
                return self._remoteUpdate(entity);
            case states.removed:
                return self._remoteRemove(entity);
        }

        return $.when(entity);
    },
    /** Commits all Pending Operations (PUT, DELETE, POST) */
    saveChanges: function (): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            changes = self.getChanges(),
            states = mapping.entityStates,

            deferreds = _.union(
                _.map(changes[states.added], e => self._remoteCreate(e)),
                _.map(changes[states.modified], e => self._remoteUpdate(e)),
                _.map(changes[states.removed], e => self._remoteRemove(e))
                );

        return utils.whenAll(deferreds);
    },

    /** Submits an Entity to the Server (internal use) */
    _remoteCreate: function (entity: any): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            oldkey = self.getKey(entity);

        if (entity.EntityState() === mapping.entityStates.added) {
            if (entity.IsSubmitting() === false) {
                entity.IsSubmitting(true);

                return self.adapter.post(self.setName, self.toJSON(entity))
                    .then(data => mapping.updateEntity(entity, data, false, false, true, self))
                    .then(() => {
                        if (oldkey !== self.getKey(entity)) {
                            self.valueWillMutate();

                            return self.localstore.remove(self.setName, oldkey)
                                .then(() => self.localstore.add(self.setName, entity))
                                .then(() => self.valueHasMutated());
                        }
                    })
                    .then(() => {
                        if (self.context.autoLazyLoading === true)
                            return mapping.refreshRelations(entity, self);
                    })
                    .then(() => entity)
                    .always(() => { entity.IsSubmitting(false); });
            }
        }

        return $.when(entity);
    },
    /** Updates an Item to the Server (internal use */
    _remoteUpdate: function (entity: any): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            key = self.getKey(entity);

        if (entity.IsSubmitting() === false) {
            entity.IsSubmitting(true);

            return self.adapter.put(self.setName, key, self.toJSON(entity))
                .then(data => mapping.updateEntity(entity, data, false, false, true, self))
                .then(() => self.store(entity))
                .always(() => { entity.IsSubmitting(false); });
        }

        return $.when(entity);
    },
    /** Deletes an Item from the Server (internal use) */
    _remoteRemove: function (entity: any): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            key = self.getKey(entity);

        if (entity.IsSubmitting() === false) {
            entity.IsSubmitting(true);

            return self.adapter.remove(self.setName, key)
                .then(() => self.localstore.remove(self.setName, key))
                .then(() => self.detach(entity))
                .always(() => { entity.IsSubmitting(false); });
        }

        return $.when();
    }
};

ko.utils.extend(dataSetFunctions, underscore.objects);
ko.utils.extend(dataSetFunctions, underscore.collections);

//#endregion
