/// <reference path="../../_references.d.ts" />
/// <reference path="../../scripts/typings/qunit/qunit.d.ts" />

import mapping = require("../../spa/data/mapping");
import common = require("./common");
import utils = require("../../spa/utils");

export function run() {
    module("Data Mapping Tests");

    test("data.mapping.getMappingConfiguration", () => {
        expect(3);

        var child = new common.models.Child(),
            derived = new common.models.ChildDerived(),

            childConf = mapping.getMappingConfiguration(child, common.datacontext.getSet("Childs")),
            derivedConf = mapping.getMappingConfiguration(derived, common.datacontext.getSet("Childs")),
            defaultConf = mapping.getMappingConfiguration(null, common.datacontext.getSet("Childs"));

        deepEqual(childConf, defaultConf, "Child mapping configuration must be equal to default Childs Data Set configuration");
        deepEqual(childConf.object, common.models.Child, "Child mapping configuration's object must be equal to common.models.Child");
        deepEqual(derivedConf.object, common.models.ChildDerived, "Child mapping configuration's object must be equal to common.models.ChildDerived");
    });

    test("data.mapping.addMappingProperties", () => {
        expect(4);

        var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents"),
            parent = new common.models.Parent();

        mapping.addMappingProperties(parent, dataset);

        var hasProperties = _.has(parent, "EntityState") && _.has(parent, "IsSubmitting") && _.has(parent, "ChangeTracker") && _.has(parent, "HasChanges"),
            hasRelationProperties = _.has(parent, "Children") && _.has(parent, "Foreign"),
            hasActionMethods = _.has(parent, "TestAction");

        ok(hasProperties, "Result object must contains at least 'EntityState', 'IsSubmitting', 'ChangeTracker' and 'HasChanges'");
        ok(hasRelationProperties, "Result object must contains all relations properties");
        ok(hasActionMethods, "Result object must contains all actions");

        throws(() => mapping.addMappingProperties(parent, dataset), Error, "addMappingProperties throw an Error if already processed");
    });

    asyncTest("data.mapping.refreshRelations", () => {
        expect(3);

        common.initDataContext().then(() => {
            var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents");

            return dataset.load(common.getFirstParentId()).then(parent => {
                return mapping.refreshRelations(parent, dataset).then(() => {
                    equal(parent.Children.size(), 6, "After refreshing relation, parent's children must be 6");
                    var foreign = parent.Foreign();
                    
                    ok(!!foreign, "After refreshing, parent must contains a foreign");
                    equal(foreign && foreign.ForeignId(), parent.ForeignId(), "After refreshing parent.ForeignId and parent.Foreign.ForeignId must be equal");
                });
            });
        }).always(start);
    });

    asyncTest("data.mapping.updateEntity", () => {
        expect(5);

        common.initDataContext().then(() => {
            var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents"),
                update = { Title: "Test" };

            return dataset.load(common.getFirstParentId()).then(parent => {
                return mapping.updateEntity(parent, update, false, false, true, dataset).then(() => {
                    equal(parent.Title(), "Test", "After update, parent's Title must be equal to 'Test'");
                    equal(parent.EntityState(), mapping.entityStates.unchanged, "Since updates are not committed, EntityState must be unchanged");

                    update = { Title: "Test2", Foreign: { ForeignId: "ecb69146-7a18-443d-9270-787d59db3794", Index: 12 } };
                    return mapping.updateEntity(parent, update, true, true, true, dataset).then(() => {
                        equal(parent.Title(), "Test2", "After second update, parent's Title must be equal to 'Test2'");
                        equal(parent.Foreign().Index(), 12, "After second update, parent's foreign's Title must be equal to '12'");
                        equal(parent.EntityState(), mapping.entityStates.modified, "Since updates are committed, EntityState must be modified");
                    });
                });
            });
        }).always(start);
    });

    asyncTest("data.mapping.duplicateEnty", () => {
        expect(3);

        common.initDataContext().then(() => {
            var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents");

            return dataset.load(common.getFirstParentId()).then(parent => {
                var duplicated = mapping.duplicateEntity(parent, dataset);

                notEqual(dataset.getKey(duplicated), dataset.getKey(parent), "Entities' keys must not be equals");
                equal(duplicated.Title(), parent.Title(), "Titles must be equals");
                equal(duplicated.ForeignId(), parent.ForeignId(), "Result object must have same Foreign as parent object");
            });
        }).always(start);
    });

    asyncTest("data.mapping.resetEntity", () => {
        expect(6);

        common.initDataContext().then(() => {
            var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents"),
                update = { Title: "Test" };

            dataset.reset();
            return dataset.load(common.getFirstParentId()).then(parent => {
                mapping.updateEntity(parent, update, true, false, true, dataset);

                equal(parent.Title(), "Test", "After update, parent's Title must be equal to 'Test'");
                equal(parent.HasChanges(), true, "After update, since committed, HasChanges must be true");
                equal(parent.EntityState(), mapping.entityStates.modified, "Since updates are committed, EntityState must be modified");

                mapping.resetEntity(parent, dataset);

                equal(parent.Title(), "Parent #0", "After reset, parent's Title must be equal to 'Parent #0'");
                equal(parent.HasChanges(), false, "After reset, HasChanges must be false");
                equal(parent.EntityState(), mapping.entityStates.unchanged, "After reset, EntityState must be unchanged");
            });
        }).always(start);
    });

    asyncTest("data.mapping.mapEntityFromJS", () => {
        expect(6);

        common.initDataContext().then(() => {
            common.datacontext.reset();
            
            var _parent = { ParentId: "ecb9b558-e597-467c-876e-cf1cb3b26ae5", Title: "Parent #1", ForeignId: "" },
                _child = { ChildId: "045dcb64-c328-48d2-8be2-0d895da2ed55", Content: "Child #2", ParentId: "" },
                _derived = { "odata.type": "SPATools.Models.ChildDerived", ChildId: "c0be0988-1e06-49c0-baec-21570a12b718", Content: "DerivedChild #0", Date: new Date().toJSON(), ParentId: "" },

                parentDfd = mapping.mapEntityFromJS(_parent, mapping.entityStates.unchanged, false, true, common.datacontext.getSet("Parents")),
                childDfd = mapping.mapEntityFromJS(_child, mapping.entityStates.unchanged, false, true, common.datacontext.getSet("Childs")),
                derivedDfd = mapping.mapEntityFromJS(_derived, mapping.entityStates.unchanged, false, true, common.datacontext.getSet("Childs"));

            return $.when(parentDfd, childDfd, derivedDfd).then(function (parent, child, derived) {
                ok(parent instanceof common.models.Parent, "After getting _parent from JS, it must be an instance of models.Parent");
                ok(child instanceof common.models.Child, "After getting _child from JS, it must be an instance of models.Child");
                ok(derived instanceof common.models.ChildDerived, "After getting _derived from JS, it must be an instance of models.ChildDerived");

                var hasProperties = _.has(parent, "EntityState") && _.has(parent, "IsSubmitting") && _.has(parent, "ChangeTracker") && _.has(parent, "HasChanges"),
                    hasRelationProperties = _.has(parent, "Children") && _.has(parent, "Foreign"),
                    hasActionMethods = _.has(parent, "TestAction");

                ok(hasProperties, "Result object must contains at least 'EntityState', 'IsSubmitting', 'ChangeTracker' and 'HasChanges'");
                ok(hasRelationProperties, "Result object must contains all relations properties");
                ok(hasActionMethods, "Result object must contains all actions");
            });
        }).always(start);
    });

    asyncTest("data.mapping.mapEntityToJS", () => {
        expect(7);

        common.initDataContext().then(() => {
            var dataset = common.datacontext.getSet<common.models.Parent, string>("Parents");

            dataset.reset();
            return dataset.load(common.getFirstParentId()).then(parent => {
                var obj = mapping.mapEntityToJS(parent, false, dataset);

                var hasProperties = _.has(obj, "EntityState") || _.has(obj, "IsSubmitting") || _.has(obj, "ChangeTracker") || _.has(obj, "HasChanges"),
                    hasRelationProperties = _.has(obj, "Children") || _.has(obj, "Foreign"),
                    hasIgnoredProperites = _.has(obj, "TitleLower") || _.has(obj, "TitleUpper"),
                    hasActionMethods = _.has(obj, "TestAction");

                equal(obj.Title, "Parent #0", "Serialized object's must be a string equals to 'Parent #0");
                ok(!hasProperties, "Serialized object must not contains mapping properties : 'EntityState', 'IsSubmitting', 'ChangeTracker' and 'HasChanges'");
                ok(!hasRelationProperties, "Serialized object must not contains relations properties");
                ok(!hasIgnoredProperites, "Serialized object must not contains ignored properties");
                ok(!hasActionMethods, "Serialized object must not contains actions");

                obj = mapping.mapEntityToJS(parent, true, dataset);
                ok(_.has(obj, "EntityState"), "Serialized object with keepstate must own EntityState property"); 
                equal(obj.EntityState, mapping.entityStates.unchanged, "Serialized object's EntityState must be unchanged");
            });
        }).always(start);
    });
}