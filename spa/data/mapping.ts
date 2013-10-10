/// <reference path="_data.d.ts" />

import changeTracker = require("../changeTracker");
import dataset = require("./dataset");
import relations = require("./relations");
import query = require("./query");
import utils = require("../utils");

//#region Enumerations / Defaults

/** Enumeration representing relations types */
export enum relationTypes {
    many,
    one,
    remote
}

/** Enumeration for differents entity states */
export enum entityStates {
    unchanged,
    added,
    modified,
    removed
}

/** Default mapping rules (internal usage) */
export var defaultRules: KnockoutMappingOptions = {
    copy: ["$type", "odata.type"],
    ignore: ["_lastData", "EntityState", "IsSubmitting", "HasChanges", "ChangeTracker", "IsRemoved", "isValid", "errors", "hasChanges", "subscription", "__ko_mapping__"]
};

//#endregion

//#region Models

/** Class representing a relation for an entity set */
export class Relation {
    public ensureRemote: boolean;

    constructor(
        public propertyName: string,
        public type: relationTypes,
        public controllerName: string,
        public foreignKey: string,
        ensureRemote?: boolean) {
        this.ensureRemote = ensureRemote || false;
    }

    public toQuery(item: any, localSet: dataset.DataSet<any, any>, foreignSet: dataset.DataSet<any, any>): query.ODataQuery {
        var localProp, foreignProp;
        if (this.type === relationTypes.one) {
            localProp = this.foreignKey;
            foreignProp = foreignSet.key;
        }
        else if (this.type === relationTypes.many) {
            localProp = localSet.key;
            foreignProp = this.foreignKey;
        }

        return new query.ODataQuery().where(foreignProp, query.operator.equal, item[localProp]);
    }
}

/** Class representing a mapping configuration for serialization / deserialization scenarios */
export class Configuration {
    public _rules: KnockoutMappingOptions;

    constructor(
        public type: string,
        public object: any = null,
        public relations: Relation[]= [],
        public rules: KnockoutMappingOptions = {},
        public actions: string[]= []) {
    }
}

/** Abstract mapping configurations for dataContext */
export class Configurations {
    private configurations = {};

    /** Get configuration by type */
    getConfiguration(type: string): Configuration {
        return this.configurations[type];
    }

    /** Add a mapping configuration */
    addConfiguration(configuration: Configuration): Configurations {
        this.configurations[configuration.type] = configuration;
        return this;
    }
    /** Add an array of mapping configurations */
    addConfigurations(configs: Configuration[]): Configurations {
        _.each(configs, this.addConfiguration, this);
        return this;
    }

    /** Remove a configuration by type */
    removeConfiguration(type: string): Configurations {
        if (this.configurations[type])
            delete this.configurations[type];

        return this;
    }
}

//#endregion

//#region Private Methods

function getEntityByName(name: string) {
    var namespaces = name.split("."),
        ctor = namespaces.pop(),
        context = window;

    for (var i = 0; i < namespaces.length; i++)
        context = context[namespaces[i]];

    return new context[ctor]();
}
function constructEntity(type: any) {
    if (!type) {
        return {};
    } else if (_.isFunction(type)) {
        return new type();
    } else {
        return getEntityByName(type.toString());
    }
}
function getEntityType(entity: any) {
    return entity && (entity.$type || entity["odata.type"]);
}

function ensureRules(config: Configuration, entity?: any, keepState?: boolean): KnockoutMappingOptions {
    var result = _.clone(config._rules);
    if (!result) {
        result = _.clone(config.rules);
        var relations = _.map(config.relations, r => r.propertyName);

        result.copy = _.union<string>(config.rules.copy || [], defaultRules.copy);
        result.ignore = _.union<string>(config.rules.ignore || [], relations, config.actions, defaultRules.ignore);

        config._rules = result;
    }

    if (keepState)
        result.ignore = _.without(result.ignore, "EntityState");

    if (entity && entity.__ko_mapping__) {
        entity.__ko_mapping__ = result;
    }

    return result;
}

function updateRelations(model: any, data: any, config: Configuration, commit: boolean, store: boolean, dataSet: dataset.DataSet<any, any>): JQueryPromise<void> {
    var foreignSet, relValue,
        dfds = _.filterMap(config.relations, relation => {
            foreignSet = dataSet.context.getSet(relation.controllerName);
            relValue = data && data[relation.propertyName];

            if (relValue) {
                switch (relation.type) {
                    case relationTypes.one:
                        return foreignSet.attachOrUpdate(relValue, commit, false, store);

                    case relationTypes.many:
                        return foreignSet.attachOrUpdateRange(relValue, commit, false, store);

                    case relationTypes.remote:
                        return foreignSet.attachOrUpdateRange(relValue, commit, false, store).then(model[relation.propertyName]);
                }
            }
        });

    return utils.whenAll(dfds);
}

function updateRelationsRange(models: any[], datas: any[], config: Configuration, commit: boolean, store: boolean, dataSet: dataset.DataSet<any, any>): JQueryPromise<void> {
    var foreignSet, data, toAttach, remoteAttach, remoteAttachTo, relValue, relProp, dfd = $.when(),
        dfds =  _.filterMap(config.relations, relation => {
            toAttach = [];
            remoteAttach = [];
            remoteAttachTo = [];
            foreignSet = dataSet.context.getSet(relation.controllerName);

            _.each(models, (model, i) => {
                data = datas[i];
                relValue = data[relation.propertyName];

                if (relValue) {
                    switch (relation.type) {
                        case relationTypes.one:
                            toAttach.push(relValue);
                            break;

                        case relationTypes.many:
                            toAttach = _.union(toAttach, relValue);
                            break;

                        case relationTypes.remote:
                            remoteAttach.push(relValue);
                            remoteAttachTo.push(model[relation.propertyName]);
                            break;
                    }
                }
            });

            if (remoteAttach.length > 0) {
                _.each(remoteAttach, (entities, i) => {
                    relProp = remoteAttachTo[i];
                    dfd = dfd.then(() => foreignSet.attachOrUpdateRange(entities, commit, false, store).then(relProp));
                });
            }

            if (toAttach.length > 0) {
                dfd = dfd.then(() => foreignSet.attachOrUpdateRange(toAttach, commit, false, store));
            }

            return dfd;
        });

    return utils.whenAll(dfds);
}

//#endregion

//#region Public Methods

export function getMappingConfiguration<T, TKey>(entity: {}, dataSet: dataset.DataSet<T, TKey>): Configuration {
    var type = getEntityType(entity) || dataSet.defaultType;
    return (type && dataSet.context.getMappingConfiguration(type)) || new Configuration(type);
}

/** Add mapping properties to an entity */
export function addMappingProperties<T, TKey>(model: any, dataSet: dataset.DataSet<T, TKey>, config?: Configuration, initialState: entityStates = entityStates.unchanged, data: any = null): any {
    if (model.EntityState) {
        throw new Error("Model already has mapping properties");
    }

    if (!config)
        config = getMappingConfiguration(model, dataSet);

    var isModified = initialState !== entityStates.unchanged,
        foreignSet;

    _.each(config.actions, action => {
        model[action] = params => dataSet.executeAction(action, params, model);
    });

    _.each(config.relations, relation => {
        foreignSet = dataSet.context.getSet(relation.controllerName);
        model[relation.propertyName] = relations.create(dataSet, foreignSet, relation, model);
    });

    model._lastData = data || {};
    model.EntityState = ko.observable(initialState);
    model.IsSubmitting = ko.observable(false);
    model.ChangeTracker = new changeTracker(model, isModified, ko.mapping.toJSON, ensureRules(config, model, false));
    model.HasChanges = ko.computed(function () {
        var state = model.EntityState();
        if (model.ChangeTracker.hasChanges()) {
            if (state === entityStates.unchanged && !model.IsSubmitting())
                model.EntityState(entityStates.modified);

            return true;
        }

        if (state === entityStates.modified) {
            model.EntityState(entityStates.unchanged);
        }

        return false;
    }).extend({ cnotify: "primitive" });

    model.IsRemoved = ko.computed(() => model.EntityState() === entityStates.removed).extend({ cnotify: "primitive" });

    return model;
}

/** Refresh all entity relations */
export function refreshRelations<T, TKey>(entity: any, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<any> {
    var config = getMappingConfiguration(entity, dataSet),
        deferreds, prop;

    if (config.relations) {
        deferreds = _.filterMap(config.relations, function (relation) {
            prop = entity[relation.propertyName];
            return !!prop && prop.refresh();
        });
    }

    return $.when.apply($, deferreds);
}

/** Duplicate specified entity and return copy */
export function duplicateEntity<T, TKey>(entity: any, dataSet: dataset.DataSet<T, TKey>): T {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = ensureRules(config, entity);

    var copy = ko.mapping.toJS(entity, mappingRules);
    copy[dataSet.key] = null;

    return ko.mapping.fromJS(copy, mappingRules);
}

/** Update specified entity with given data */
export function updateEntity<T, TKey>(entity: any, data: any, commit: boolean, expand: boolean, store: boolean, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<T> {
    if (!data) {
        if (!commit) {
            entity.EntityState(entityStates.unchanged);
            entity.ChangeTracker.reset();
        }

        return $.when(entity);
    }

    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = ensureRules(config, entity);

    ko.mapping.fromJS(data, mappingRules, entity);

    if (!commit) {
        entity.EntityState(entityStates.unchanged);
        entity.ChangeTracker.reset();
    }

    if (expand) {
        return updateRelations(entity, data, config, commit, store, dataSet).then(() => entity);
    }

    return $.when(entity);
}

/** Update specified set of entities with given data array */
export function updateEntities<T, TKey>(entities: any[], datas: any[], commit: boolean, expand: boolean, store: boolean, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<T[]> {
    if (datas.length === 0) {
        if (!commit) {
            _.each(entities, entity => {
                entity.EntityState(entityStates.unchanged);
                entity.ChangeTracker.reset();
            });
        }

        return $.when(entities);
    }

    var config, data, mappingRules;

    _.each(entities, (entity, i) => {
        data = datas[i];
        config = getMappingConfiguration(entity, dataSet);
        mappingRules = ensureRules(config, entity);
        ko.mapping.fromJS(data, mappingRules, entity);

        if (!commit) {
            entity.EntityState(entityStates.unchanged);
            entity.ChangeTracker.reset();
        }
    });

    if (expand) {
        return updateRelationsRange(entities, datas, config, commit, store, dataSet).then(() => entities);
    }

    return $.when(entities);
}

/** Reset specified entity with last remote data */
export function resetEntity<T, TKey>(entity: any, dataSet: dataset.DataSet<T, TKey>): T {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = ensureRules(config, entity);

    ko.mapping.fromJS(entity._lastData, mappingRules, entity);

    entity.EntityState(entityStates.unchanged);
    entity.ChangeTracker.reset();

    return entity;
}

//#endregion

//#region Mapping Methods

export function mapEntitiesFromJS<T, TKey>(datas: any[], initialState: entityStates, expand: boolean, store: boolean, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<T[]> {
    if (datas.length === 0) {
        return $.when(datas);
    }

    var config, model,
        result = _.map(datas, data => {
            config = getMappingConfiguration(data, dataSet);
            model = config.object ? constructEntity(config.object) : {};

            if (!_.isUndefined(data.EntityState) && initialState === entityStates.unchanged) {
                initialState = data.EntityState;
                delete data.EntityState;
            }

            ko.mapping.fromJS(data, config.rules, model);
            addMappingProperties(model, dataSet, config, initialState, data);

            return model;
        });

    if (expand) {
        return updateRelationsRange(result, datas, config, initialState !== entityStates.unchanged, store, dataSet).then(() => result);
    }

    return $.when(result);
}

export function mapEntityFromJS<T, TKey>(data: any, initialState: entityStates, expand: boolean, store: boolean, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<T> {
    var config = getMappingConfiguration(data, dataSet),
        model = config.object ? constructEntity(config.object) : {};

    if (!_.isUndefined(data.EntityState) && initialState === entityStates.unchanged) {
        initialState = data.EntityState;
        delete data.EntityState;
    }

    ko.mapping.fromJS(data, config.rules, model);
    addMappingProperties(model, dataSet, config, initialState, data);

    if (expand) {
        return updateRelations(model, data, config, initialState !== entityStates.unchanged, store, dataSet).then(() => model);
    }

    return $.when(model);
}

export function mapEntityToJS<T, TKey>(entity: any, keepState: boolean, dataSet: dataset.DataSet<T, TKey>): any {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = ensureRules(config, entity, keepState);

    var data = ko.mapping.toJS(entity, mappingRules);

    return data;
}

export function mapEntityFromJSON<T, TKey>(json: string, initialState: entityStates, expand: boolean, store: boolean, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<T> {
    var obj = ko.utils.parseJson(json);
    return mapEntityFromJS(obj, initialState, expand, store, dataSet);
}

export function mapEntityToJSON<T, TKey>(entity: any, keepstate: boolean, dataSet: dataset.DataSet<T, TKey>): string {
    var obj = mapEntityToJS(entity, keepstate, dataSet);
    return ko.utils.stringifyJson(obj);
}

//#endregion
