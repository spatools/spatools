/// <reference path="_data.d.ts" />

import changeTracker = require("../changeTracker");
import dataset = require("./dataset");
import relationview = require("./relationview");
import remoteview = require("./remoteview");
import foreignview = require("./foreignview");

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
    removed,
}

/** Default mapping rules (internal usage) */
export var defaultRules: KnockoutMappingOptions = {
    copy: ["$type", "odata.type"],
    ignore: ["_lastData", "EntityState", "IsSubmitting", "HasChanges", "ChangeTracker", "IsRemoved", "isValid", "errors", "hasChanges", "subscription"]
}

//#endregion

//#region Models

/** Class representing a relation for an entity set */
export class Relation {
    constructor(
        public propertyName: string,
        public type: relationTypes,
        public controllerName: string,
        public foreignKey: string,
        public ensureRemote: boolean = false) { }
}

/** Class representing a mapping configuration for serialization / deserialization scenarios */
export class Configuration {
    public rules: KnockoutMappingOptions = {
        copy: defaultRules.copy.slice(0),
        ignore: defaultRules.ignore.slice(0)
    };

    constructor(
        public type: string, 
        public object: any = null, 
        public relations: Relation[] = [], 
        rules: KnockoutMappingOptions = null,
        public actions: string[] = []) {
            if (rules) {
                if (rules.ignore)
                    _.each(rules.ignore, rule => this.rules.ignore.push(rule));

                if (rules.copy)
                    _.each(rules.copy, rule => this.rules.copy.push(rule));
            }
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
    if (!type)
        return {};
    else if (_.isFunction(type))
        return new type();
    else
        return getEntityByName(type.toString());
}
function getEntityType(entity: {}) {
    return entity["$type"] || entity["odata.type"];
}
function getMappingConfiguration<T, TKey>(entity: {}, dataSet: dataset.DataSet<T, TKey>): Configuration {
    var type = getEntityType(entity) || dataSet.defaultType;
    return (type && dataSet.context.getMappingConfiguration(type)) || new Configuration(type);
}

//#endregion

//#region Public Methods

/** Add mapping properties to an entity */
export function addMappingProperties<T, TKey>(model: any, dataSet: dataset.DataSet<T, TKey>, config?: Configuration, initialState: entityStates = entityStates.unchanged, data: any = null): any {
    if (model.EntityState)
        throw "Model already has mapping properties";

    if (!config)
        config = getMappingConfiguration(model, dataSet);

    var mappingRules = config.rules,
        isModified = initialState !== entityStates.unchanged,
        foreignPropertyNames: string[] = [], foreignSet;

    if (config.actions) {
        _.each(config.actions, action => {
            model[action] = params => dataSet.executeAction(action, params, model);
        });
        mappingRules.ignore = _.union(mappingRules.ignore, config.actions);
    }

    //Relations
    if (config.relations) {
        _.each(config.relations, relation => {
            foreignPropertyNames.push(relation.propertyName);
            foreignSet = dataSet.context[relation.controllerName];

            switch (relation.type) {
                case relationTypes.one:
                    model[relation.propertyName] = foreignview.create(relation.propertyName, dataSet, model, foreignSet, relation.foreignKey, relation.ensureRemote);

                    if (data && data[relation.propertyName])
                        foreignSet.attachOrUpdate(data[relation.propertyName], initialState !== entityStates.unchanged);

                    break;

                case relationTypes.many:
                    model[relation.propertyName] = relationview.create(relation.propertyName, dataSet, model, foreignSet, dataSet.key, relation.foreignKey, relation.ensureRemote);

                    if (data && data[relation.propertyName])
                        foreignSet.attachOrUpdateRange(data[relation.propertyName], initialState !== entityStates.unchanged);

                    break;

                case relationTypes.remote:
                    model[relation.propertyName] = remoteview.create(relation.propertyName, dataSet, model, foreignSet, dataSet.key);

                    if (data && data[relation.propertyName]) {
                        var mapped = foreignSet.attachOrUpdateRange(data[relation.propertyName], initialState !== entityStates.unchanged);
                        model[relation.propertyName](mapped);
                    }

                    break;
            }
        });
    }
    mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);

    model._lastData = data || {};
    model.EntityState = ko.observable(initialState);
    model.IsSubmitting = ko.observable(false);
    model.ChangeTracker = new changeTracker(model, isModified, ko.mapping.toJSON, mappingRules);
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
export function refreshRelations<T, TKey>(entity: T, dataSet: dataset.DataSet<T, TKey>): JQueryPromise<any> {
    var config = getMappingConfiguration(entity, dataSet),
        deferreds = [], prop;

    if (config.relations) {
        var deferreds = _.filterMap(config.relations, function (relation) {
            prop = entity[relation.propertyName];
            return !!prop && prop.refresh();
        });
    }

    return $.when.apply($, deferreds);
}

/** Duplicate specified entity and return copy */
export function duplicateEntity<T, TKey>(entity: T, dataSet: dataset.DataSet<T, TKey>): T {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = config.rules;

    if (config.relations) {
        var foreignPropertyNames = _.map(config.relations, (relation) => relation.propertyName);
        mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);
    }

    var copy = ko.mapping.toJS(entity, mappingRules);
    copy[dataSet.key] = null;

    return ko.mapping.fromJS(copy, mappingRules);
}

/** Update specified entity with specified data */
export function updateEntity<T, TKey>(entity: any, data: any, commit: boolean, dataSet: dataset.DataSet<T, TKey>): any {
    if (!data) {
        if (!commit) {
            entity.EntityState(entityStates.unchanged);
            entity.ChangeTracker.reset();
        }

        return entity;
    }

    var config = getMappingConfiguration(entity, dataSet),
        foreignPropertyNames = [], mappingRules = config.rules,
        relProp, relValue, set;

    if (config.relations) {
        _.each(config.relations, function (relation) {
            foreignPropertyNames.push(relation.propertyName);
            relValue = data[relation.propertyName];
            set = dataSet.context[relation.controllerName];

            if (relValue) {
                if (relation.type === relationTypes.one)
                    set.attachOrUpdate(relValue, commit);
                else if (relation.type === relationTypes.many)
                    set.attachOrUpdateRange(relValue, commit);
            }
        });

        mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);
    }

    ko.mapping.fromJS(data, mappingRules, entity);

    if (!commit) {
        entity.EntityState(entityStates.unchanged);
        entity.ChangeTracker.reset();
    }

    return entity;
}

/** Reset specified entity with last remote data */
export function resetEntity<T, TKey>(entity: any, dataSet: dataset.DataSet<T, TKey>): void {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = config.rules;

    if (config.relations) {
        var foreignPropertyNames = _.map(config.relations, (relation) => relation.propertyName);
        mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);
    }

    ko.mapping.fromJS(entity._lastData, mappingRules, entity);

    entity.EntityState(entityStates.unchanged);
}

//#endregion

//#region Mapping Methods

export function mapEntityFromJS<T, TKey>(data: any, initialState: entityStates, dataSet: dataset.DataSet<T, TKey>): T {
    var config = getMappingConfiguration(data, dataSet),
        model = config.object ? constructEntity(config.object) : {};

    ko.mapping.fromJS(data, config.rules, model);
    addMappingProperties(model, dataSet, config, initialState, data);

    return model;
}

export function mapEntityToJS<T, TKey>(entity: any, keepState: boolean, dataSet: dataset.DataSet<T, TKey>): any {
    var config = getMappingConfiguration(entity, dataSet),
        mappingRules = config.rules;

    if (config.relations) {
        var foreignPropertyNames = _.map(config.relations, (relation) => relation.propertyName);
        mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);

        if (keepState) {
            mappingRules.ignore = _.without<string>(mappingRules.ignore, "EntityState");
            if (entity.__ko_mapping__) {
                entity.__ko_mapping__.ignore = _.without(entity.__ko_mapping__.ignore, "EntityState");
                entity.__ko_mapping__.mappedProperties.EntityState = true;
            }
        }
    }

    var data = ko.mapping.toJS(entity, mappingRules);
    entity._lastData = data;

    return data;
}

export function mapEntityFromJSON<T, TKey>(json: string, initialState: entityStates, dataSet: dataset.DataSet<T, TKey>): T {
    var obj = ko.utils.parseJson(json);
    return mapEntityFromJS(obj, initialState, dataSet);
}

export function mapEntityToJSON<T, TKey>(entity: any, keepstate: boolean, dataSet: dataset.DataSet<T, TKey>): string {
    var obj = mapEntityToJS(entity, keepstate, dataSet);
    return ko.utils.stringifyJson.call(null, obj);
}

//#endregion