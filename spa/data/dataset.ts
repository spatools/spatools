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
    store: stores.IDataStore;

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
    refresh(mode: string): JQueryPromise<T[]>;
    refresh(mode: string, query: query.ODataQuery): JQueryPromise<T[]>;

    /** Query server to refresh dataset */
    query(): JQueryPromise<T[]>;
    query(query: query.ODataQuery): JQueryPromise<T[]>;

    /** Load an entity by id from the remote source */
    load(key: TKey): JQueryPromise<T>;
    load(key: TKey, query: query.ODataQuery): JQueryPromise<T>;
    load(key: TKey, mode: string): JQueryPromise<T>;
    load(key: TKey, mode: string, query: query.ODataQuery): JQueryPromise<T>;
    load(key: TKey, mode?: string, query?: query.ODataQuery): JQueryPromise<T>;

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
    /** Attach an Array of entities to the dataSet */
    attachRange(entities: T[]): JQueryPromise<T[]>;
    /** Stop an entity from being tracked by the dataSet */
    detach(entity: T): void;
    /** Stop an array of entities from being tracked by the dataSet */
    detachRange(entityKeys: TKey[]): void;
    /** Attach or update entity if existing with current data and commit changes if commit is set to true */
    attachOrUpdate(data: any, commit?: boolean): JQueryPromise<T>;
    /** Attach or update entities if existing with current data and commit changes if commit is set to true */
    attachOrUpdateRange(data: any[], commit?: boolean): JQueryPromise<T[]>;

    /** Create a JS object from given entity */
    toJS(entity: T): any;
    toJS(entity: T, keepstate: boolean): any;
    /** Serialize given entity to JSON */
    toJSON(entity: T): string;
    toJSON(entity: T, keepstate: boolean): string;

    /** Instanciate an entity from a JS object */
    fromJS(data: any): T;
    fromJS(data: any, state: mapping.entityStates): T;
    /** Instanciate an entity from a JSON string */
    fromJSON(json: string): T;
    fromJSON(json: string, state: mapping.entityStates): T;

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
                dataset.store.update(dataset.setName, entity);
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
}

function _updateDataSet(dataset: DataSet<any, any>, result: adapters.IAdapterResult, query?: query.ODataQuery): JQueryPromise<any[]> {
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
            rmDfd = dataset.store.removeRange(dataset.setName, report.removed)
                .then(() => dataset.detachRange(report.removed));
        }
    }

    return $.when(rmDfd).then(() => {
        if (result.count >= 0 && (!query || query.filters.size() === 0))
            dataset.remoteCount(result.count);

        return isArray ? dataset.attachOrUpdateRange(result.data) : dataset.attachOrUpdate(result.data);
    });
}

function _updateFromStore(dataset: DataSet<any, any>, query?: query.ODataQuery): JQueryPromise<any[]> {
    return dataset.store.getAll(dataset.setName, query).then(entities => {
        var toUpdate = false,
            table = dataset(),
            key, entity,

            dfds = _.filterMap(entities, data => {
                entity = dataset.findByKey(dataset.getKey(data));
                if (!entity) {
                    entity = dataset.fromJS(data);
                    if (!toUpdate) {
                        dataset.valueWillMutate();
                        toUpdate = true;
                    }

                    key = dataset.getKey(entity);
                    table[key] = entity;

                    return _initAttachedEntity(dataset, entity);
                }

                return mapping.updateEntity(entity, data, false, dataset);
            });

        return utils.whenAll(dfds).done(() => toUpdate && dataset.valueHasMutated());
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
    result.store = dataContext.store;

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
        this.store = store;
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

    /** Refresh dataset from remote source */
    refresh: function (mode: string = "remote", query?: query.ODataQuery): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this;
        if (mode === "remote") {
            return self.adapter.getAll(self.setName, query)
                .then(result => _updateDataSet(self, result, query));
        }
        else {
            return _updateFromStore(self, query);
        }
    },
    /** Query remote source without attaching result to dataset */
    query: function (query?: query.ODataQuery): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this;
        return self.adapter.getAll(self.setName, query).then(result => {
            if (result.count >= 0)
                self.remoteCount(result.count);

            return _.map(result.data, e => self.fromJS(e));
        });
    },
    /** Load an entity by id from the remote source */
    load: function (key: any, mode?: any, query?: query.ODataQuery): JQueryPromise<any> {
        var self = <DataSet<any, any>>this;
        if (!mode) mode = "remote";
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = "remote";
        }

        if (mode === "remote") {
            return self.adapter.getOne(self.setName, key, query)
                .then(data => self.attachOrUpdate(data));
        }
        else {
            return self.store.getOne(self.setName, key, query).then(data => {
                var table = self(),
                    key = self.getKey(data),
                    entity = self.findByKey(self.getKey(data));

                if (!entity) {
                    entity = self.fromJS(data);

                    self.valueWillMutate();
                    table[key] = entity;
                    self.valueHasMutated();

                    return _initAttachedEntity(self, entity);
                }

                return mapping.updateEntity(entity, data, false, self);
            });
        }
    },

    /** Get relation by ensuring using specific remote action and not filter */
    refreshRelation: function (entity: any, propertyName: string, mode?: any, query?: query.ODataQuery): JQueryPromise<any[]> {
        if (!this.adapter.getRelation) {
            throw new Error("This adapter does not support custom relations");
        }

        if (!mode) mode = "remote";
        if (!query && !_.isString(mode)) {
            query = mode;
            mode = "remote";
        }

        var self = <DataSet<any, any>>this,
            config = mapping.getMappingConfiguration(entity, self),
            relation = _.find(config.relations, r => r.propertyName === propertyName);

        if (!relation)
            throw "This relation is not configured on this entity type";

        if (mode === "remote") {
            return self.adapter.getRelation(self.setName, propertyName, self.getKey(entity), query) 
                .then(result => _updateDataSet(self.context.getSet(relation.controllerName), result, query));
        }
        else {
            return _updateFromStore(self.context.getSet(relation.controllerName), query);
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
            return this.store.update(this.setName, entity).then(() => entity);
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
            return this.store.update(this.setName, entity).then(() => entity);
        }

        return $.when(entity);
    },

    /** Reset entity to its original state */
    resetEntity: function (entity: any): JQueryPromise<any> {
        mapping.resetEntity(entity, this);
        return this.store.update(this.setName, entity).then(() => entity);
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
    attach: function (entity: any): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            table = self(),
            key = self.getKey(entity);

        if (!self.isAttached(entity)) {
            self.valueWillMutate();

            return self.store.add(self.setName, entity)
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
    attachRange: function (entities: any[]): JQueryPromise<any[]> {
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

        if (toUpdate) {
            dfds.push(self.store.addRange(self.setName, toStore));
        }

        return utils.whenAll(dfds)
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
    attachOrUpdate: function (data: any, commit: boolean = false): JQueryPromise<any> {
        var self = <DataSet<any, any>>this,
            existing = self.findByKey(self.getKey(data));

        if (!existing) {
            var newEntity = self.fromJS(data, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged);
            return self.attach(newEntity);
        }

        mapping.updateEntity(existing, data, commit, self);

        return self.store.update(self.setName, existing).then(() => existing);
    },
    /** Attach or update entities if existing with current data and commit changes if commit is set to true */
    attachOrUpdateRange: function (data: any[], commit: boolean = false): JQueryPromise<any[]> {
        var self = <DataSet<any, any>>this,
            toAttach = [], toUpdate = [],
            result = _.map(data, item => {
                var existing = self.findByKey(self.getKey(item));

                if (!existing) {
                    var newEntity = self.fromJS(item, commit === true ? mapping.entityStates.added : mapping.entityStates.unchanged);
                    toAttach.push(newEntity);
                    return newEntity;
                }

                toUpdate.push(existing);
                return mapping.updateEntity(existing, item, commit, self);
            });

        return $.when(
            self.store.updateRange(self.setName, toUpdate),
            self.attachRange(toAttach)
        ).then(() => result);
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
                    .then(data => mapping.updateEntity(entity, data, false, self))
                    .then(() => {
                        if (oldkey !== self.getKey(entity)) {
                            self.valueWillMutate();

                            return self.store.remove(self.setName, oldkey)
                                .then(() => self.store.add(self.setName, entity))
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
                .then(data => mapping.updateEntity(entity, data, false, self))
                .then(() => self.store.update(self.setName, entity))
                .then(() => entity)
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
                .then(() => self.store.remove(self.setName, key))
                .then(() => self.detach(entity))
                .always(() => { entity.IsSubmitting(false); });
        }

        return $.when();
    }
};

ko.utils.extend(dataSetFunctions, underscore.objects);
ko.utils.extend(dataSetFunctions, underscore.collections);

//#endregion
