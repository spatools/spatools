/// <reference path="../../_references.d.ts" />
/// <reference path="../../scripts/typings/qunit/qunit.d.ts" />

import context = require("../../spa/data/context");
import dataset = require("../../spa/data/dataset");
import relations = require("../../spa/data/relations");
import stores = require("../../spa/data/stores");
import adapters = require("../../spa/data/adapters");
import mapping = require("../../spa/data/mapping");
import query = require("../../spa/data/query");
import guid = require("../../spa/data/guid");
import utils = require("../../spa/utils");

//#region Models

export module models {
    export class Parent {
        public "odata.type";
        public EntityState: KnockoutObservable<mapping.entityStates>;

        public ParentId = ko.observable<string>();
        public Title = ko.observable("");

        // Client only properties
        public TitleUpper: KnockoutComputed<string>;
        public TitleLower: KnockoutComputed<string>;

        public ForeignId = ko.observable<string>();

        // Navigation properties
        public Children: relations.Collection<Child>;
        public Foreign: relations.Foreign<Foreign>;

        constructor() {
            this["odata.type"] = "SPATools.Models.Parent";
            this.TitleUpper = ko.computed(() => this.Title().toUpperCase());
            this.TitleLower = ko.computed(() => this.Title().toLowerCase());
        }
    }
    export class Child {
        public "odata.type";

        public ChildId = ko.observable<string>();
        public Content = ko.observable("");

        public ParentId = ko.observable<string>();

        constructor() {
            this["odata.type"] = "SPATools.Models.Child";
        }
    }
    export class ChildDerived extends Child {
        public "odata.type";

        public Date = ko.observable<string>().extend({ moment: { utc: true } });

        constructor() {
            super();
            this["odata.type"] = "SPATools.Models.ChildDerived";
        }
    }
    export class Foreign {
        public "odata.type";

        public ForeignId = ko.observable<string>();
        public Index = ko.observable<number>(-1);

        constructor() {
            this["odata.type"] = "SPATools.Models.Foreign";
        }
    }
}

//#endregion

//#region DataContext Configuration

export var datacontext = new context.DataContext();
datacontext.buffer = true;
datacontext.addSet<models.Parent, string>("Parents", "ParentId", "SPATools.Models.Parent");
datacontext.addSet<models.Child, string>("Childs", "ChildId", "SPATools.Models.Child");
datacontext.addSet<models.Foreign, string>("Foreigns", "ForeignId", "SPATools.Models.Foreign");

datacontext.mapping.addConfigurations([
    new mapping.Configuration(
        "SPATools.Models.Parent",
        models.Parent,
        [
            new mapping.Relation("Children", mapping.relationTypes.many, "Childs", "ParentId"),
            new mapping.Relation("Foreign", mapping.relationTypes.one, "Foreigns", "ForeignId"),
        ],
        {
            ignore: ["TitleUpper", "TitleLower"]
        },
        ["TestAction"]
    ),
    new mapping.Configuration("SPATools.Models.Child", models.Child),
    new mapping.Configuration("SPATools.Models.ChildDerived", models.ChildDerived),
    new mapping.Configuration("SPATools.Models.Foreign", models.Foreign)
]);

//#endregion

//#region Data Generator

var parentIds = [
    "f78baf57-e958-424b-bdaf-ea891ac96978",
    "ecb9b558-e597-467c-876e-cf1cb3b26ae5",
    "c331c8c1-b7a4-4a9e-9712-4c07c8eaa2ec",
    "632a01f1-94bd-4628-a8e5-78feb0836fb0",
    "14d803fa-902c-40d9-90b5-e4ea1dde64b5",
    "8965a336-6d56-4fef-962b-e42af69f7afd",
    "9395545b-2676-429f-9b48-515f1005c82c",
    "96cc7b53-38ba-497a-8b87-43b9db9cc423",
    "9bff0741-615e-4a48-b3ee-30f57807081d",
    "8cec3579-2bcb-43ee-943c-a0c20f2aca36"
];

function generateData(): any {
    return {
        Parents: generateParents(),
        Childs: generateChilds(),
        Foreigns: generateForeigns()
    };
}

function generateParents() {
    return {
        "f78baf57-e958-424b-bdaf-ea891ac96978": { ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978", Title: "Parent #0", ForeignId: "ecb69146-7a18-443d-9270-787d59db3794" },
        "ecb9b558-e597-467c-876e-cf1cb3b26ae5": { ParentId: "ecb9b558-e597-467c-876e-cf1cb3b26ae5", Title: "Parent #1", ForeignId: "9c6f8925-d41d-45fc-a202-c9cd24ac6baf" },
        "c331c8c1-b7a4-4a9e-9712-4c07c8eaa2ec": { ParentId: "c331c8c1-b7a4-4a9e-9712-4c07c8eaa2ec", Title: "Parent #2", ForeignId: "d93ad2ad-4340-4157-a7af-f4908153a17c" },
        "632a01f1-94bd-4628-a8e5-78feb0836fb0": { ParentId: "632a01f1-94bd-4628-a8e5-78feb0836fb0", Title: "Parent #3", ForeignId: "8b9944af-2460-4e99-bf4c-aefd5f2cfb91" },
        "14d803fa-902c-40d9-90b5-e4ea1dde64b5": { ParentId: "14d803fa-902c-40d9-90b5-e4ea1dde64b5", Title: "Parent #4", ForeignId: "07da55a3-2f4e-4439-a95e-0fd55ffae853" },
        "8965a336-6d56-4fef-962b-e42af69f7afd": { ParentId: "8965a336-6d56-4fef-962b-e42af69f7afd", Title: "Parent #5", ForeignId: "cadd7d99-7910-466c-977a-9d913907b9f7" },
        "9395545b-2676-429f-9b48-515f1005c82c": { ParentId: "9395545b-2676-429f-9b48-515f1005c82c", Title: "Parent #6", ForeignId: "147a776e-4bac-49a5-858d-e29c67e7e4d2" },
        "96cc7b53-38ba-497a-8b87-43b9db9cc423": { ParentId: "96cc7b53-38ba-497a-8b87-43b9db9cc423", Title: "Parent #7", ForeignId: "a4d06a00-a59a-4f55-aa33-30771da33a62" },
        "9bff0741-615e-4a48-b3ee-30f57807081d": { ParentId: "9bff0741-615e-4a48-b3ee-30f57807081d", Title: "Parent #8", ForeignId: "c268f391-b3fc-414c-84b5-e03eb9438d31" },
        "8cec3579-2bcb-43ee-943c-a0c20f2aca36": { ParentId: "8cec3579-2bcb-43ee-943c-a0c20f2aca36", Title: "Parent #9", ForeignId: "f2f2dfc5-808c-495c-a2a6-0c7a89b96845" }
    };
}

function generateChilds() {
    var childs = {
        "2ce441d4-8d9f-4503-af53-572574245507": { ChildId: "2ce441d4-8d9f-4503-af53-572574245507", Content: "Child #0", ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" },
        "20a49610-602f-4a34-827c-d2cbef80384f": { ChildId: "20a49610-602f-4a34-827c-d2cbef80384f", Content: "Child #1", ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" },
        "045dcb64-c328-48d2-8be2-0d895da2ed55": { ChildId: "045dcb64-c328-48d2-8be2-0d895da2ed55", Content: "Child #2", ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" },
        "c0be0988-1e06-49c0-baec-21570a12b718": { ChildId: "c0be0988-1e06-49c0-baec-21570a12b718", Content: "DerivedChild #0", Date: new Date().toJSON(), ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" },
        "ef33569d-5ea4-445f-a01b-323cdc8e0146": { ChildId: "ef33569d-5ea4-445f-a01b-323cdc8e0146", Content: "DerivedChild #1", Date: new Date().toJSON(), ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" },
        "6cd47642-3b76-4ff9-a9c9-08d1b4e8eb1a": { ChildId: "6cd47642-3b76-4ff9-a9c9-08d1b4e8eb1a", Content: "DerivedChild #2", Date: new Date().toJSON(), ParentId: "f78baf57-e958-424b-bdaf-ea891ac96978" }
    };

    for (var i = 0; i < 100; i++) {
        var key = guid.generate(),
            parentId = parentIds[_.random(1, 9)];

        childs[key] = { ChildId: key, Content: "GeneratedChild #" + i, ParentId: parentId };
    }

    return childs;
}

function generateForeigns() {
    return {
        "ecb69146-7a18-443d-9270-787d59db3794": { ForeignId: "ecb69146-7a18-443d-9270-787d59db3794", Index: 0 },
        "9c6f8925-d41d-45fc-a202-c9cd24ac6baf": { ForeignId: "9c6f8925-d41d-45fc-a202-c9cd24ac6baf", Index: 1 },
        "d93ad2ad-4340-4157-a7af-f4908153a17c": { ForeignId: "d93ad2ad-4340-4157-a7af-f4908153a17c", Index: 2 },
        "8b9944af-2460-4e99-bf4c-aefd5f2cfb91": { ForeignId: "8b9944af-2460-4e99-bf4c-aefd5f2cfb91", Index: 3 },
        "07da55a3-2f4e-4439-a95e-0fd55ffae853": { ForeignId: "07da55a3-2f4e-4439-a95e-0fd55ffae853", Index: 4 },
        "cadd7d99-7910-466c-977a-9d913907b9f7": { ForeignId: "cadd7d99-7910-466c-977a-9d913907b9f7", Index: 5 },
        "147a776e-4bac-49a5-858d-e29c67e7e4d2": { ForeignId: "147a776e-4bac-49a5-858d-e29c67e7e4d2", Index: 6 },
        "a4d06a00-a59a-4f55-aa33-30771da33a62": { ForeignId: "a4d06a00-a59a-4f55-aa33-30771da33a62", Index: 7 },
        "c268f391-b3fc-414c-84b5-e03eb9438d31": { ForeignId: "c268f391-b3fc-414c-84b5-e03eb9438d31", Index: 8 },
        "f2f2dfc5-808c-495c-a2a6-0c7a89b96845": { ForeignId: "f2f2dfc5-808c-495c-a2a6-0c7a89b96845", Index: 9 }
    };
}

//#endregion

//#region Fake Stores and adapters

export class FakeDataAdapter implements adapters.IAdapter {
    public memory;
    public context: context.DataContext;
    public actionCallback: (action: string, parameters?: any, id?: any) => any;

    constructor(context?: context.DataContext, generate?: boolean) {
        if (context)
            this.context = context;

        if (generate)
            this.memory = generateData();
    }

    //#region Public Methods

    public getAll(controller: string, query?: query.ODataQuery): JQueryPromise<adapters.IAdapterResult> {
        return this.getStore(controller).then(store => {
            var result = _.values(store),
                count = result.length;

            if (query) {
                result = query.apply(result);


                if (query.selects.size() > 0) {
                    result = this.applySelectsRange(result, query.selects());
                }

                if (query.expands.size() > 0) {
                    return this.applyExpandsRange(controller, query.expands(), result);
                }
            }

            return {
                data: result,
                count: count
            };
        });
    }
    public getOne(controller: string, id: any, query?: query.ODataQuery): JQueryPromise<any> {
        return this.getStore(controller).then(store => {
            var entity = store[id];

            if (entity && query) {
                if(query.selects.size() > 0) {
                    entity = this.applySelects(entity, query.selects());
                }

                if (query.expands.size() > 0) {
                    return this.applyExpands(controller, query.expands(), entity);
                }
            }

            return entity;
        });
    }

    public post(controller: string, data: any): JQueryPromise<any> {
        return this.getStore(controller).then(store => {
            var dataset = this.context.getSet(controller),
                key = guid.generate();
            
            data[dataset.key] = key;
            store[key] = data;

            return data;
        });
    }
    public put(controller: string, id: any, data: any): JQueryPromise<any> {
        return this.getStore(controller).then(store => {
            store[id] = data;
            return data;
        });
    }
    public remove(controller: string, id: any): JQueryPromise<any> {
        return this.getStore(controller).then(store => { delete store[id]; });
    }

    public getRelation(controller: string, relationName: string, id: any, query?: query.ODataQuery): JQueryPromise<adapters.IAdapterResult> {
        return this.getOne(controller, id).then(entity => {
            var dataset = this.context.getSet(controller),
                conf = mapping.getMappingConfiguration(entity, dataset),
                relation = _.find(conf.relations, r => r.propertyName === relationName);

            if (relation) {
                var q = relation.toQuery(item, dataset, this.context.getSet(relation.controllerName));
                return this.getAll(relation.controllerName, q);
            }
            else {
                return utils.wrapError({
                    errorCode: "404",
                    errorDetails: "Not Found"
                });
            }
        });
    }
    public action(controller: string, action: string, parameters: any, id?: any): JQueryPromise<any> {
        return utils.timeout().then(() => {
            if (this.actionCallback)
                this.actionCallback(action, parameters, id);
        });
    }

    //#endregion

    //#region Private Methods

    private getStore(controller: string): JQueryPromise<any> {
        return utils.timeout().then(() => {
            if (!this.memory[controller])
                this.memory[controller] = {};

            return this.memory[controller];
        });
    }

    private applySelects(item: any, selects: string[]): any {
        var args = [item, "$type", "odata.type", "EntityState"].concat(selects);
        return _.pick.apply(_, args);
    }
    private applySelectsRange(items: any[], selects: string[]): any {
        return _.map(items, item => this.applySelects(item, selects));
    }

    private applyExpands(setName: string, expands: string[], item: any, _set?: dataset.DataSet<any, any>): JQueryPromise<any> {
        var dataset = _set || this.context.getSet(setName),
            conf = mapping.getMappingConfiguration(item, dataset),

            dfds = _.filterMap(conf.relations, (relation: mapping.Relation) => {
                if (_.contains(expands, relation.propertyName)) {
                    return utils.timeout().then(() => {
                        var q = relation.toQuery(item, dataset, this.context.getSet(relation.controllerName));
                        return this.getAll(relation.controllerName, q).then(entities => {
                            item[relation.propertyName] = entities;
                        });
                    });
                }
            });

        return utils.whenAll(dfds).then(() => item);
    }
    private applyExpandsRange(setName: string, expands: string[], result: any[]): JQueryPromise<any[]> {
        var dataset = this.context.getSet(setName),
            dfds = _.map(result, item => this.applyExpands(setName, expands, item, dataset));

        return utils.whenAll(dfds).then(() => result);
    }

    //#endregion
}

export class FakeDataStore {

}

//#endregion

//#region Utility Methods

var initialized = false;
export function initDataContext(store?: stores.IDataStore, adapter?: adapters.IAdapter, force?: boolean): JQueryPromise<any> {
    if (initialized && !force)
        return $.when();

    initialized = true;

    var dfds = [
        datacontext.setAdapter(adapter || new FakeDataAdapter(datacontext, true))
    ];

    if (store)
        dfds.push(datacontext.setLocalStore(store));

    return utils.whenAll(dfds);
}

export function getFirstParentId(): string {
    return parentIds[0];
}

//#endregion