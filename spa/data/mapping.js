define(["require", "exports", "../changeTracker", "./relationview", "./remoteview", "./foreignview"], function(require, exports, __changeTracker__, __relationview__, __remoteview__, __foreignview__) {
    /// <reference path="_data.d.ts" />
    var changeTracker = __changeTracker__;
    
    var relationview = __relationview__;
    var remoteview = __remoteview__;
    var foreignview = __foreignview__;

    //#region Enumerations / Defaults
    /** Enumeration representing relations types */
    (function (relationTypes) {
        relationTypes[relationTypes["many"] = 0] = "many";
        relationTypes[relationTypes["one"] = 1] = "one";

        relationTypes[relationTypes["remote"] = 2] = "remote";
    })(exports.relationTypes || (exports.relationTypes = {}));
    var relationTypes = exports.relationTypes;

    /** Enumeration for differents entity states */
    (function (entityStates) {
        entityStates[entityStates["unchanged"] = 0] = "unchanged";
        entityStates[entityStates["added"] = 1] = "added";
        entityStates[entityStates["modified"] = 2] = "modified";
        entityStates[entityStates["removed"] = 3] = "removed";
    })(exports.entityStates || (exports.entityStates = {}));
    var entityStates = exports.entityStates;

    /** Default mapping rules (internal usage) */
    exports.defaultRules = {
        copy: ["$type", "odata.type"],
        ignore: ["_lastData", "EntityState", "IsSubmitting", "HasChanges", "ChangeTracker", "IsRemoved", "isValid", "errors", "hasChanges", "subscription"]
    };

    //#endregion
    //#region Models
    /** Class representing a relation for an entity set */
    var Relation = (function () {
        function Relation(propertyName, type, controllerName, foreignKey, ensureRemote) {
            if (typeof ensureRemote === "undefined") { ensureRemote = false; }
            this.propertyName = propertyName;
            this.type = type;
            this.controllerName = controllerName;
            this.foreignKey = foreignKey;
            this.ensureRemote = ensureRemote;
        }
        return Relation;
    })();
    exports.Relation = Relation;

    /** Class representing a mapping configuration for serialization / deserialization scenarios */
    var Configuration = (function () {
        function Configuration(type, object, relations, rules, actions) {
            if (typeof object === "undefined") { object = null; }
            if (typeof relations === "undefined") { relations = []; }
            if (typeof rules === "undefined") { rules = null; }
            if (typeof actions === "undefined") { actions = []; }
            var _this = this;
            this.type = type;
            this.object = object;
            this.relations = relations;
            this.actions = actions;
            this.rules = {
                copy: exports.defaultRules.copy.slice(0),
                ignore: exports.defaultRules.ignore.slice(0)
            };
            if (rules) {
                if (rules.ignore)
                    _.each(rules.ignore, function (rule) {
                        return _this.rules.ignore.push(rule);
                    });

                if (rules.copy)
                    _.each(rules.copy, function (rule) {
                        return _this.rules.copy.push(rule);
                    });
            }
        }
        return Configuration;
    })();
    exports.Configuration = Configuration;

    /** Abstract mapping configurations for dataContext */
    var Configurations = (function () {
        function Configurations() {
            this.configurations = {};
        }
        /** Get configuration by type */
        Configurations.prototype.getConfiguration = function (type) {
            return this.configurations[type];
        };

        /** Add a mapping configuration */
        Configurations.prototype.addConfiguration = function (configuration) {
            this.configurations[configuration.type] = configuration;
            return this;
        };

        /** Add an array of mapping configurations */
        Configurations.prototype.addConfigurations = function (configs) {
            _.each(configs, this.addConfiguration, this);
            return this;
        };

        /** Remove a configuration by type */
        Configurations.prototype.removeConfiguration = function (type) {
            if (this.configurations[type])
                delete this.configurations[type];

            return this;
        };
        return Configurations;
    })();
    exports.Configurations = Configurations;

    //#endregion
    //#region Private Methods
    function getEntityByName(name) {
        var namespaces = name.split("."), ctor = namespaces.pop(), context = window;

        for (var i = 0; i < namespaces.length; i++)
            context = context[namespaces[i]];

        return new context[ctor]();
    }
    function constructEntity(type) {
        if (!type)
            return {}; else if (_.isFunction(type))
            return new type(); else
            return getEntityByName(type.toString());
    }
    function getEntityType(entity) {
        return entity["$type"] || entity["odata.type"];
    }
    function getMappingConfiguration(entity, dataSet) {
        var type = getEntityType(entity) || dataSet.defaultType;
        return (type && dataSet.context.getMappingConfiguration(type)) || new Configuration(type);
    }

    //#endregion
    //#region Public Methods
    /** Add mapping properties to an entity */
    function addMappingProperties(model, dataSet, config, initialState, data) {
        if (typeof initialState === "undefined") { initialState = entityStates.unchanged; }
        if (typeof data === "undefined") { data = null; }
        if (model.EntityState)
            throw "Model already has mapping properties";

        if (!config)
            config = getMappingConfiguration(model, dataSet);

        var mappingRules = config.rules, isModified = initialState !== entityStates.unchanged, foreignPropertyNames = [], foreignSet;

        if (config.actions) {
            _.each(config.actions, function (action) {
                model[action] = function (params) {
                    return dataSet.executeAction(action, params, model);
                };
            });
            mappingRules.ignore = _.union(mappingRules.ignore, config.actions);
        }

        if (config.relations) {
            _.each(config.relations, function (relation) {
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

        model.IsRemoved = ko.computed(function () {
            return model.EntityState() === entityStates.removed;
        }).extend({ cnotify: "primitive" });

        return model;
    }
    exports.addMappingProperties = addMappingProperties;

    /** Refresh all entity relations */
    function refreshRelations(entity, dataSet) {
        var config = getMappingConfiguration(entity, dataSet), deferreds = [], prop;

        if (config.relations) {
            var deferreds = _.filterMap(config.relations, function (relation) {
                prop = entity[relation.propertyName];
                return !!prop && prop.refresh();
            });
        }

        return $.when.apply($, deferreds);
    }
    exports.refreshRelations = refreshRelations;

    /** Duplicate specified entity and return copy */
    function duplicateEntity(entity, dataSet) {
        var config = getMappingConfiguration(entity, dataSet), mappingRules = config.rules;

        if (config.relations) {
            var foreignPropertyNames = _.map(config.relations, function (relation) {
                return relation.propertyName;
            });
            mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);
        }

        var copy = ko.mapping.toJS(entity, mappingRules);
        copy[dataSet.key] = null;

        return ko.mapping.fromJS(copy, mappingRules);
    }
    exports.duplicateEntity = duplicateEntity;

    /** Update specified entity with specified data */
    function updateEntity(entity, data, commit, dataSet) {
        if (!data) {
            if (!commit) {
                entity.EntityState(entityStates.unchanged);
                entity.ChangeTracker.reset();
            }

            return entity;
        }

        var config = getMappingConfiguration(entity, dataSet), foreignPropertyNames = [], mappingRules = config.rules, relProp, relValue, set;

        if (config.relations) {
            _.each(config.relations, function (relation) {
                foreignPropertyNames.push(relation.propertyName);
                relValue = data[relation.propertyName];
                set = dataSet.context[relation.controllerName];

                if (relValue) {
                    if (relation.type === relationTypes.one)
                        set.attachOrUpdate(relValue, commit); else if (relation.type === relationTypes.many)
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
    exports.updateEntity = updateEntity;

    /** Reset specified entity with last remote data */
    function resetEntity(entity, dataSet) {
        var config = getMappingConfiguration(entity, dataSet), mappingRules = config.rules;

        if (config.relations) {
            var foreignPropertyNames = _.map(config.relations, function (relation) {
                return relation.propertyName;
            });
            mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);
        }

        ko.mapping.fromJS(entity._lastData, mappingRules, entity);

        entity.EntityState(entityStates.unchanged);
    }
    exports.resetEntity = resetEntity;

    //#endregion
    //#region Mapping Methods
    function mapEntityFromJS(data, initialState, dataSet) {
        var config = getMappingConfiguration(data, dataSet), model = config.object ? constructEntity(config.object) : {};

        ko.mapping.fromJS(data, config.rules, model);
        exports.addMappingProperties(model, dataSet, config, initialState, data);

        return model;
    }
    exports.mapEntityFromJS = mapEntityFromJS;

    function mapEntityToJS(entity, keepState, dataSet) {
        var config = getMappingConfiguration(entity, dataSet), mappingRules = config.rules;

        if (config.relations) {
            var foreignPropertyNames = _.map(config.relations, function (relation) {
                return relation.propertyName;
            });
            mappingRules.ignore = _.union(mappingRules.ignore, foreignPropertyNames);

            if (keepState) {
                mappingRules.ignore = _.without(mappingRules.ignore, "EntityState");
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
    exports.mapEntityToJS = mapEntityToJS;

    function mapEntityFromJSON(json, initialState, dataSet) {
        var obj = ko.utils.parseJson(json);
        return exports.mapEntityFromJS(obj, initialState, dataSet);
    }
    exports.mapEntityFromJSON = mapEntityFromJSON;

    function mapEntityToJSON(entity, keepstate, dataSet) {
        var obj = exports.mapEntityToJS(entity, keepstate, dataSet);
        return ko.utils.stringifyJson(obj);
    }
    exports.mapEntityToJSON = mapEntityToJSON;
});
