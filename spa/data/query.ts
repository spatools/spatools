/// <reference path="_data.d.ts" />

import utils = require("../utils");
import guid = require("./guid");

export var operator = {
    equal: "eq",
    notEqual: "ne",
    greaterThan: "gt",
    greaterThanOrEqual: "ge",
    lessThan: "lt",
    lessThanOrEqual: "le",
    and: "and",
    or: "or",
    not: "not"
};

export var mathOperator = {
    add: "add",
    sub: "sub",
    mul: "mul",
    div: "div",
    mod: "mod"
};

export var math = {
    round: "round({0})",
    floor: "floor({0})",
    ceiling: "ceiling({0})"
};

export var string = {
    substringof: "substringof({0}, {1})",
    endswith: "endswith({0}, {1})",
    startswith: "startswith({0}, {1})",
    length: "length({0})",
    indexof: "indexof({0}, {1})",
    replace: "replace({0}, {1}, {2})",
    substring: "substring({0}, {1})",
    substringTo: "substring({0}, {1}, {2})",
    tolower: "tolower({0})",
    toupper: "toupper({0})",
    trim: "trim({0})",
    concat: "concat({0}, {1})"
};

export var date = {
    day: "day({0})",
    hour: "hour({0})",
    minute: "minute({0})",
    month: "month({0})",
    second: "second({0})",
    year: "year({0})"
};

export var type = {
    isof: "isof({1})",
    propisof: "isof({0}, {1})"
};

export class Filter {
    public field: KnockoutSubscribable<string>;
    public operator: KnockoutObservable<string>;
    public value: KnockoutObservable<any>;

    constructor(field: any, operator?: any, value?: any) {
        this.field = utils.createObservable(field);
        this.operator = utils.createObservable(operator);
        this.value = utils.createObservable(value);
    }

    //#region Public Methods

    /** Creates a String acceptable for odata Query String $filter */
    public toQueryString(): string {
        var field = this.field(),
            operator = this.operator(),
            value = this.value();

        if (!field) {
            return null;
        }

        if (!operator && !value) { //if field implicite
            return field;
        }

        return utils.format("{0} {1} {2}", field, operator, this.formatValue(value));
    }

    /** Return a function to filter entities using underscore */
    public toUnderscoreQuery(): (item: any) => boolean {
        var self = this,
            field = this.field(),
            _operator = this.operator(),
            value = this.value();

        if (_.isUndefined(value) || _.isNull(value))
            value = null;

        return function (item: any) {
            var itemField = self.getItemField(item, field);

            if (!_operator)
                _operator = null;

            if (_.isUndefined(itemField) || _.isNull(itemField))
                itemField = null;

            switch (_operator) {
                case operator.equal:
                    return itemField === value;
                case operator.notEqual:
                    return itemField !== value;
                case operator.greaterThan:
                    return itemField > value;
                case operator.greaterThanOrEqual:
                    return itemField <= value;
                case operator.lessThan:
                    return itemField < value;
                case operator.lessThanOrEqual:
                    return itemField <= value;
                case null:
                    return itemField;
                default:
                    return true;
            }
        };
    }

    //#endregion

    //#region Private Methods

    public getValueType(value?: any): string {
        value = _.isUndefined(value) ? this.value() : value;

        if (_.isUndefined(value) || _.isNull(value)) { return "null"; }
        else if (_.isNumber(value)) { return null; }
        else if (guid.isGuid(value)) { return "guid"; }
        else if (moment(value) && moment(value).isValid()) { return "datetime"; }
        else if (_.isString(value)) { return "string"; }
    }

    public formatValue(value?: any): string {
        value = _.isUndefined(value) ? this.value() : value;
        var type = this.getValueType(value);

        if (!type) {
            return value;
        }

        if (type === "null") {
            return !!this.operator() ? type : ""; // if no operator the field is a bool himself
        }

        return utils.format("{0}'{1}'", type.replace("string", ""), value);
    }

    public getItemField(item: any, field: string): any {
        return ko.utils.unwrapObservable(item[field]);
    }

    //#endregion
}

export class FunctionFilter extends Filter {
    public fn: KnockoutObservable<string>;
    private _field: KnockoutObservable<string>;
    public args: KnockoutObservable<any>;
    public field: KnockoutSubscribable<string>;

    constructor(fn: any, field: any, args?: any, operator?: any, value?: any) {
        this.fn = utils.createObservable(fn);
        this._field = utils.createObservable(field);
        this.args = utils.createObservable(args, []);

        super(field, operator, value);

        this.field = ko.computed(this.formatField, this);
    }

    public getItemField(item: any, field: string): any {
        var _itemField = super.getItemField(item, this._field()),
            args = ko.toJS(this.args),
            _itemFieldString = (_itemField || "").toString(),
            _itemFieldDate = _itemField && moment.isMoment(_itemField.date) ? _itemField.date : moment(_itemFieldString),
            _itemFieldNumber = parseFloat(_itemFieldString),
            argString = (args[0] || "").toString();

        switch (this.fn()) {
            case string.substringof:
                return _itemFieldString.toLowerCase().indexOf(argString.toLowerCase()) !== -1;
            case string.endswith:
                return (new RegExp(argString + "$")).test(_itemFieldString);
            case string.startswith:
                return (new RegExp("^" + argString)).test(_itemFieldString);
            case string.length:
                return _itemFieldString.length;
            case string.indexof:
                return _itemFieldString.indexOf(args[0]);
            case string.replace:
                return _itemFieldString.replace(args[0], args[1]);
            case string.substring:
                return _itemFieldString.substr(args[0]);
            case string.substringTo:
                return _itemFieldString.substr(args[0], args[1]);
            case string.tolower:
                return _itemFieldString.toLowerCase();
            case string.toupper:
                return _itemFieldString.toUpperCase();
            case string.trim:
                return _itemFieldString.trim();
            case string.concat:
                return _itemFieldString.concat(args[0]);

            case date.day:
                return _itemFieldDate && _itemFieldDate.day();
            case date.hour:
                return _itemFieldDate && _itemFieldDate.hour();
            case date.minute:
                return _itemFieldDate && _itemFieldDate.minute();
            case date.month:
                return _itemFieldDate && _itemFieldDate.month();
            case date.second:
                return _itemFieldDate && _itemFieldDate.second();
            case date.year:
                return _itemFieldDate && _itemFieldDate.year();

            case math.round:
                return Math.round(_itemFieldNumber);
            case math.floor:
                return Math.floor(_itemFieldNumber);
            case math.ceiling:
                return Math.ceil(_itemFieldNumber);

            case type.isof: // TODO : IsOf TODO
                return ko.utils.unwrapObservable(item["odata.type"]) === args[0];
            case type.propisof:
                return true;
        }
    }

    private formatField(): string {
        var fn = this.fn(),
            args = this.args();

        args = _.isArray(args) ? ko.toJS(args) : [args];

        if (_.contains([string.substringof, string.endswith, string.startswith, string.indexof], fn) && (!args.length || !args[0])) {
            return null;
        }

        args = _.map(args, this.formatValue, this);
        return utils.format.apply(null, _.union([fn, this._field()], args));
    }
}

export class Ordering {
    public field: KnockoutObservable<string>;
    public ascending: KnockoutObservable<boolean>;

    constructor(field: any, ascending: any) {
        this.field = utils.createObservable<string>(field);
        this.ascending = utils.createObservable<boolean>(ascending, true);
    }

    /** Creates a String acceptable for odata Query String $orderby */
    public toQueryString(): string {
        return utils.format("{0} {1}", this.field(), this.ascending() ? "asc" : "desc");
    }

    /** Create a sorting function to sort entities locally */
    public toSortFunction(): (item1: any, item2: any) => number {
        var field = this.field(),
            asc = this.ascending();

        return function (item1, item2) {
            var itemField1 = ko.utils.unwrapObservable(item1[field]);
            var itemField2 = ko.utils.unwrapObservable(item2[field]);

            if (itemField1 > itemField2) { return 1 * (asc ? 1 : -1); }
            if (itemField1 < itemField2) { return -1 * (asc ? 1 : -1); }
            return 0;
        };
    }
}

export class ODataQuery {
    public pageNum: KnockoutObservable<number>;
    public pageSize: KnockoutObservable<number>;
    public ordersby: KnockoutObservableArray<Ordering>;
    public filters: KnockoutObservableArray<any>;
    public total: KnockoutObservable<boolean>;
    public includeDeleted: KnockoutObservable<boolean>;
    public selects: KnockoutObservableArray<string>;
    public expands: KnockoutObservableArray<string>;

    constructor(options?: any) {
        options = _.extend({ pageNum: 0, pageSize: 0, orderBy: [], filters: [], includeDeleted: false, total: false }, options || {});

        this.pageNum = utils.createObservable(options.pageNum);
        this.pageSize = utils.createObservable(options.pageSize);
        this.ordersby = utils.createObservableArray(options.ordersBy);
        this.filters = utils.createObservableArray(options.filters);
        this.selects = utils.createObservableArray(options.selects);
        this.expands = utils.createObservableArray(options.expands);
        this.total = utils.createObservable<boolean>(options.total, false);
        this.includeDeleted = utils.createObservable<boolean>(options.includeDeleted, false);
    }

    public addFilter(field: any, type: any, value: any): ODataQuery {
        return this.where(field, type, value);
    }
    public addOrdering(field: any, ascending: any): ODataQuery {
        return this.orderby(field, ascending);
    }

    public where(field: string): ODataQuery;
    public where(field: string, operator: string, value: string): ODataQuery;
    public where(fn: string, field: string): ODataQuery;
    public where(fn: string, field: string, args: any[]): ODataQuery;
    public where(fn: string, field: string, operator: string, value: string): ODataQuery;
    public where(fn: string, field: string, args: any[], operator: string, value: string): ODataQuery;
    public where(...args): ODataQuery {
        /// <signature>
        ///     <summary>Add a simple filter to the query, field must be of Boolean Type</summary>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>
        /// <signature>
        ///     <summary>Add a simple filter to the query, field must be of Boolean Type</summary>
        ///     <param name="function" type="String">Function to apply to field</param>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>
        /// <signature>
        ///     <summary>Add a simple filter to the query</summary>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <param name="operator" type="String">Operator to apply in filter</param>
        ///     <param name="value" type="mixed">Value to filter with</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>
        /// <signature>
        ///     <summary>Add a simple filter to the query, field must be of Boolean Type</summary>
        ///     <param name="function" type="String">Function to apply to field</param>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <param name="args" type="Array" elementType="String">Arguments for function</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>
        /// <signature>
        ///     <summary>Add a filter with a method to the query</summary>
        ///     <param name="function" type="String">Function to apply to field</param>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <param name="operator" type="String">Operator to apply in filter</param>
        ///     <param name="value" type="mixed">Value to filter with</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>
        /// <signature>
        ///     <summary>Add a filter with a function and arguments to the query</summary>
        ///     <param name="function" type="String">Function to apply to field</param>
        ///     <param name="field" type="String">Name of the field to filter</param>
        ///     <param name="args" type="Array" elementType="String">Arguments for function</param>
        ///     <param name="operator" type="String">Operator to apply in filter</param>
        ///     <param name="value" type="mixed">Value to filter with</param>
        ///     <returns type="spa.odataQuery">Return this for chaining</returns>
        /// </signature>

        var filter;
        switch (args.length) {
            case 1:
                filter = new Filter(args[0]);
                break;

            case 2:
                filter = new FunctionFilter(args[0], args[1]);
                break;

            case 3:
                filter = _.isArray(args[2]) ?
                new FunctionFilter(args[0], args[1], args[2]) :
                new Filter(args[0], args[1], args[2]);
                break;

            case 4:
                filter = new FunctionFilter(args[0], args[1], args[2], args[3]);
                break;

            case 5:
                filter = new FunctionFilter(args[0], args[1], args[2], args[3], args[4]);
                break;
        }

        if (filter)
            this.filters.push(filter);

        return this;
    }

    /** Order by specified field */
    public orderby(field: any, ascending?: any): ODataQuery {
        var order = this.ordersby.find(order => order.field() === ko.utils.unwrapObservable(field));
        if (order) {
            if (order.ascending() !== ascending)
                order.ascending(ascending);
        }
        else
            this.ordersby.push(new Ordering(field, ascending));

        return this;
    }

    public expand(...fields: string[]): ODataQuery {
        this.expands.push.apply(this.expands, fields);
        return this;
    }
    public select(...fields: string[]): ODataQuery {
        this.selects.push.apply(this.selects, fields);
        return this;
    }

    public and(): ODataQuery {
        this.filters.push(operator.and);
        return this;
    }
    public or(): ODataQuery {
        this.filters.push(operator.or);
        return this;
    }

    /** Creates an OData Query string (includes $filter, $skip, $top, $orderby) */
    public toQueryString(): string {
        var qstring = [], filters = [], orders,
            lastIsFilter = false, showTotal = this.total(),
            pageNum = this.pageNum(), pageSize = this.pageSize(),
            selects = this.selects(), expands = this.expands();

        if ((pageNum !== 0 || pageSize !== 0) && this.ordersby.size() === 0) {
            throw "You must specify atleast 1 order function when using paging";
        }

        if (pageNum !== 0 && pageSize === 0) {
            throw "You cannot specify a page number without a page size";
        }

        _.each(this.filters(), function (filter) {
            if (_.isObject(filter)) {
                var query = filter.toQueryString();
                if (!utils.isNullOrWhiteSpace(query)) {
                    if (lastIsFilter)
                        filters.push(operator.and);

                    filters.push(query);
                    lastIsFilter = true;
                }
            }
            else if (_.isString(filter)) {
                if (lastIsFilter) {
                    filters.push(filter);
                    lastIsFilter = false;
                }
            }
        });

        if (lastIsFilter === false && filters.length > 0)
            filters.splice(filters.length - 1, 1);

        if (filters.length)
            qstring.push("$filter=" + filters.join(" "));

        if (selects.length)
            qstring.push("$select=" + selects.join(","));

        if (expands.length)
            qstring.push("$expand=" + expands.join(","));

        if (pageNum) {
            qstring.push("$skip=" + (pageSize * (pageNum - 1)));
            showTotal = true;
        }
        if (pageSize) {
            qstring.push("$top=" + pageSize);
            showTotal = true;
        }

        orders = this.ordersby.map(order => order.toQueryString());

        if (orders.length)
            qstring.push("$orderby=" + orders.join(", "));

        if (showTotal === true) {
            qstring.push("$inlinecount=allpages");
        }

        return qstring.join("&");
    }
    /** Returns a function for local filtering */
    public toLocalFilter(): (item) => boolean {
        var filters = [], lastIsFilter = false;

        if (this.includeDeleted() !== true) {
            filters.push((e) => !ko.utils.unwrapObservable(e.IsRemoved));
            filters.push(operator.and);
        }

        this.filters.each((filter: any) => {
            if (_.isObject(filter)) {
                if (lastIsFilter)
                    filters.push(operator.and);

                filters.push(filter.toUnderscoreQuery());
                lastIsFilter = true;
            }
            else if (_.isString(filter)) {
                filters.push(filter);
                lastIsFilter = false;
            }
        });

        if (filters.length > 0) {
            return function (item) {
                var result = true, or = false;

                _.each(filters, function (filter) {
                    if (_.isFunction(filter)) {
                        var fresult = filter.call(null, item);
                        result = or ? result || fresult : result && fresult;
                    }
                    else if (_.isString(filter)) {
                        or = (filter === operator.or);
                    }
                });

                return result;
            };
        }

        return null;
    }
    /** Returns a function for local sorting */
    public toLocalSorting(): (item1, item2) => number {
        var orders = this.ordersby.map(order => order.toSortFunction());
        if (orders.length) {
            return function (item1, item2) {
                var result = 0, i = 0;

                while (result === 0 && i < orders.length) {
                    var sort = orders[i++];
                    result = sort(item1, item2);
                }

                return result;
            };
        }

        return null;
    }

    /** Filter specified array */
    public applyFilters<T>(array: T[]): T[] {
        var filter = this.toLocalFilter();
        return filter ? _.filter(array, filter) : array;
    }
    /** Sort specified array */
    public applySorting<T>(array: T[]): T[] {
        var sorter = this.toLocalSorting();
        return sorter ? array.sort(sorter) : array;
    }
    /** Apply paging to specified array */
    public applyPaging<T>(array: T[], correctPageNum: boolean = false): T[] {
        var pageSize = this.pageSize();

        if (pageSize > 0) {
            var pageNum = this.pageNum() || 1,
                min = (pageNum - 1) * pageSize,
                max = pageNum * pageSize;

            if (array.length < min) {
                if (correctPageNum) {
                    while (array.length < min) {
                        pageNum = pageNum - 1;

                        min = (pageNum - 1) * pageSize;
                        max = pageNum * pageSize;
                    }

                    this.pageNum(pageNum);
                }
                else
                    return [];
            }

            if (max >= array.length)
                max = array.length;

            array = array.slice(min, max);
        }

        return array;
    }
    /** Apply this query to specified array */
    public apply<T>(array: T[], correctPageNum: boolean = false): T[] {
        array = this.applyFilters(array);
        array = this.applySorting(array);
        array = this.applyPaging(array, correctPageNum);

        return array;
    }
}
