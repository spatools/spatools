/// <reference path="../../_references.d.ts" />
/// <reference path="../../scripts/typings/qunit/qunit.d.ts" />

import query = require("../../spa/data/query");
import utils = require("../../spa/utils");

export function run() {
    module("Data Query Tests");

    //#region Filter Tests

    test("data.query.filter.toquerystring", () => {
        expect(4);

        var filter = new query.Filter("MyField", query.operator.equal, 0),
            expected = "MyField eq 0",
            querystring = filter.toQueryString(),
            date = new Date().toJSON();

        equal(querystring, expected, "Query string filter must be formatted like '{MyProperty} {operator} {value}'");

        filter.value("test");
        expected = "MyField eq 'test'";
        querystring = filter.toQueryString();

        equal(querystring, expected, "If value is a string, it must be like '{value}'");

        filter.value("01234567-89AB-CDEF-0123-456789abcdef");
        expected = "MyField eq guid'01234567-89AB-CDEF-0123-456789abcdef'";
        querystring = filter.toQueryString();

        equal(querystring, expected, "If value is a guid, it must be like guid'{value}'");

        filter.value(date);
        expected = "MyField eq datetime'" + date + "'";
        querystring = filter.toQueryString();

        equal(querystring, expected, "If value is a date, it must be like datetime'{value}'");
    });

    test("data.query.filter.tounderscore", () => {
        expect(3);

        var filter = new query.Filter("MyField", query.operator.greaterThan, 0),
            objs = [
                { MyField: 0 },
                { MyField: 1 },
                { MyField: 2 },
                { MyField: 3 },
            ],
            filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 3, "objs contains 3 objects where MyField property is greater than 0");

        filter.operator(query.operator.lessThan);
        filter.value(2);
        filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 2, "objs contains 2 objects where MyField property is less than 2");

        filter.operator(query.operator.greaterThanOrEqual);
        filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 2, "objs contains 2 objects where MyField property is greater than or equal to 2");
    });

    test("data.query.functionfilter.toquerystring", () => {
        expect(2);

        var filter = new query.FunctionFilter(query.string.substringof, "MyField", ["bc"]),
            expected = "substringof(MyField, 'bc')",
            querystring = filter.toQueryString();

        equal(querystring, expected, "Boolean functions must be formatted like {method}({property}, {arg})");

        filter.fn(query.string.indexof);
        filter.args(["def"]);
        filter.operator(query.operator.equal);
        filter.value(3);
        querystring = filter.toQueryString();
        expected = "indexof(MyField, 'def') eq 3"

        equal(querystring, expected, "Function filters must be formatted like {method}({property}, {arg}) {operator} {value}");
    });

    test("data.query.functionfilter.tounderscore", () => {
        expect(3);

        var filter = new query.FunctionFilter(query.string.substringof, "MyField", ["bc"]),
            objs = [
                { MyField: "abcdef" },
                { MyField: "abc" },
                { MyField: "def" },
                { MyField: "bc" },
            ],
            filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 3, "objs contains 3 objects where MyField property contains 'bc'");

        filter.fn(query.string.startswith);
        filter.args(["abc"]);
        filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 2, "objs contains 2 objects where MyField property starts with 'abc'");

        filter.fn(query.string.indexof);
        filter.args(["def"]);
        filter.operator(query.operator.equal);
        filter.value(3);
        filtered = _.filter(objs, filter.toUnderscoreQuery());

        equal(filtered.length, 1, "objs contains 1 object where MyField property contains 'def' at index 3");
    });

    //#endregion

    //#region Ordering

    test("data.query.ordering.toquerystring", () => {
        expect(2);

        var order = new query.Ordering("MyField"),
            expected = "MyField asc",
            querystring = order.toQueryString();

        equal(querystring, expected, "Query string ordering must be formatted like MyField asc'");

        order.ascending(false);
        expected = "MyField desc";
        querystring = order.toQueryString();

        equal(querystring, expected, "Query string ordering desceding must be formatted like MyField desc'");
    });

    test("data.query.ordering.toquerystring", () => {
        expect(2);

        var order = new query.Ordering("MyField"),
            obj1 = { MyField: "d" },
            objs = [
                obj1,
                { MyField: "a" },
                { MyField: "c" },
                { MyField: "e" },
            ],
            ordered = objs.sort(order.toSortFunction());

        equal(_.indexOf(ordered, obj1), 2, "After sorting ascending, obj1 must be at index 2");

        order.ascending(false);
        ordered = objs.sort(order.toSortFunction());

        equal(_.indexOf(ordered, obj1), 1, "After sorting descending, obj1 must be at index 2");
    });

    //#endregion

    //#region ODataQuery

    test("data.query.odataquery.toquerystringwithor", () => {
        expect(1);

        var _query = new query.ODataQuery();
        _query.where("MyField", query.operator.equal, "abc")
            .or()
            .where("MyNumber", query.operator.greaterThan, 2)
            .orderby("MyField")
            .select("MyField", "MyNumber")
            .expand("MyExpand");

        var expected = "$filter=MyField eq 'abc' or MyNumber gt 2&$select=MyField,MyNumber&$expand=MyExpand&$orderby=MyField asc",
            querystring = _query.toQueryString();

        equal(querystring, expected, "This query string is not well formatted");
    });

    test("data.query.odataquery.toquerystringwithand", () => {
        expect(1);

        var _query = new query.ODataQuery();
        _query.where("MyField", query.operator.equal, "abc")
            .where("MyNumber", query.operator.greaterThan, 2)
            .orderby("MyField")
            .select("MyField", "MyNumber")
            .expand("MyExpand");

        var expected = "$filter=MyField eq 'abc' and MyNumber gt 2&$select=MyField,MyNumber&$expand=MyExpand&$orderby=MyField asc",
            querystring = _query.toQueryString();

        equal(querystring, expected, "This query string is not well formatted");
    });

    test("data.query.odataquery.applywithor", () => {
        expect(2);

        var _query = new query.ODataQuery();
        _query.where("MyField", query.operator.equal, "abc")
            .or()
            .where("MyNumber", query.operator.greaterThan, 2)
            .orderby("MyField").orderby("MyNumber");

        var obj1 = { MyField: "abc", MyNumber: 5 };
        var objs = [
            obj1,
            { MyField: "abc", MyNumber: 1 },
            { MyField: "def", MyNumber: 3 },
            { MyField: "ghi", MyNumber: 1 },
            { MyField: "ijk", MyNumber: 0 }
        ];

        var result = _query.apply(objs);
        equal(result.length, 3, "After processing query, result lenght must be 3");
        equal(_.indexOf(result, obj1), 1, "After processing query, obj1 must be at index 1");
    });

    test("data.query.odataquery.applywithand", () => {
        expect(2);

        var _query = new query.ODataQuery();
        _query.where("MyField", query.operator.equal, "abc")
            .where("MyNumber", query.operator.greaterThan, 2)
            .orderby("MyNumber");

        var obj1 = { MyField: "abc", MyNumber: 5 };
        var objs = [
            obj1,
            { MyField: "abc", MyNumber: 3 },
            { MyField: "abc", MyNumber: 6 },
            { MyField: "abc", MyNumber: 1 },
            { MyField: "ijk", MyNumber: 0 }
        ];

        var result = _query.apply(objs);
        equal(result.length, 3, "After processing query, result lenght must be 3");
        equal(_.indexOf(result, obj1), 1, "After processing query, obj1 must be at index 1");
    });

    //#endregion
}