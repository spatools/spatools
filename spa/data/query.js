var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../utils", "./guid"], function(require, exports, __utils__, __guid__) {
    /// <reference path="_data.d.ts" />
    var utils = __utils__;
    var guid = __guid__;

    exports.operator = {
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

    exports.mathOperator = {
        add: "add",
        sub: "sub",
        mul: "mul",
        div: "div",
        mod: "mod"
    };

    exports.math = {
        round: "round({0})",
        floor: "floor({0})",
        ceiling: "ceiling({0})"
    };

    exports.string = {
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

    exports.date = {
        day: "day({0})",
        hour: "hour({0})",
        minute: "minute({0})",
        month: "month({0})",
        second: "second({0})",
        year: "year({0})"
    };

    exports.type = {
        isof: "isof({1})",
        propisof: "isof({0}, {1})"
    };

    var Filter = (function () {
        function Filter(field, operator, value) {
            this.field = utils.createObservable(field);
            this.operator = utils.createObservable(operator);
            this.value = utils.createObservable(value);
        }
        //#region Public Methods
        /** Creates a String acceptable for odata Query String $filter */
        Filter.prototype.toQueryString = function () {
            var field = this.field(), operator = this.operator(), value = this.value();

            if (!field)
                return null;

            if (!operator && !value)
                return field;

            return spa.format("{0} {1} {2}", field, operator, this.formatValue(value));
        };

        /** Return a function to filter entities using underscore */
        Filter.prototype.toUnderscoreQuery = function () {
            var self = this, field = this.field(), _operator = this.operator(), value = this.value();

            if (_.isUndefined(value) || _.isNull(value))
                value = null;

            return function (item) {
                var itemField = self.getItemField(item, field);

                if (!_operator)
                    _operator = null;

                if (_.isUndefined(itemField) || _.isNull(itemField))
                    itemField = null;

                switch (_operator) {
                    case exports.operator.equal:
                        return itemField === value;
                    case exports.operator.notEqual:
                        return itemField !== value;
                    case exports.operator.greaterThan:
                        return itemField > value;
                    case exports.operator.greaterThanOrEqual:
                        return itemField <= value;
                    case exports.operator.lessThan:
                        return itemField < value;
                    case exports.operator.lessThanOrEqual:
                        return itemField <= value;
                    case null:
                        return itemField;
                    default:
                        return true;
                }
            };
        };

        //#endregion
        //#region Private Methods
        Filter.prototype.getValueType = function (value) {
            value = _.isUndefined(value) ? this.value() : value;

            if (_.isUndefined(value) || _.isNull(value))
                return "null"; else if (_.isNumber(value))
                return null; else if (guid.isGuid(value))
                return "guid"; else if (moment(value) && moment(value).isValid())
                return "datetime"; else if (_.isString(value))
                return "string";
        };

        Filter.prototype.formatValue = function (value) {
            value = _.isUndefined(value) ? this.value() : value;
            var type = this.getValueType(value);

            if (!type)
                return value;

            if (type === "null")
                return !!this.operator() ? type : "";

            return spa.format("{0}'{1}'", type.replace("string", ""), value);
        };

        Filter.prototype.getItemField = function (item, field) {
            return ko.utils.unwrapObservable(item[field]);
        };
        return Filter;
    })();
    exports.Filter = Filter;

    var FunctionFilter = (function (_super) {
        __extends(FunctionFilter, _super);
        function FunctionFilter(fn, field, args, operator, value) {
            this.fn = utils.createObservable(fn);
            this._field = utils.createObservable(field);
            this.args = utils.createObservable(args, []);

            _super.call(this, field, operator, value);

            this.field = ko.computed(this.formatField, this);
        }
        FunctionFilter.prototype.getItemField = function (item, field) {
            var _itemField = _super.prototype.getItemField.call(this, item, field), args = ko.toJS(this.args), _itemFieldString = (_itemField || "").toString(), _itemFieldDate = _itemField && moment.isMoment(_itemField.date) ? _itemField.date : moment(_itemFieldString), _itemFieldNumber = parseFloat(_itemFieldString), argString = (args[0] || "").toString();

            switch (this.fn()) {
                case exports.string.substringof:
                    return _itemFieldString.toLowerCase().indexOf(argString.toLowerCase()) != -1;
                case exports.string.endswith:
                    return (new RegExp(argString + "$")).test(_itemFieldString);
                case exports.string.startswith:
                    return (new RegExp("^" + argString)).test(_itemFieldString);
                case exports.string.length:
                    return _itemFieldString.length;
                case exports.string.indexof:
                    return _itemFieldString.indexOf(args[0]);
                case exports.string.replace:
                    return _itemFieldString.replace(args[0], args[1]);
                case exports.string.substring:
                    return _itemFieldString.substr(args[0]);
                case exports.string.substringTo:
                    return _itemFieldString.substr(args[0], args[1]);
                case exports.string.tolower:
                    return _itemFieldString.toLowerCase();
                case exports.string.toupper:
                    return _itemFieldString.toUpperCase();
                case exports.string.trim:
                    return _itemFieldString.trim();
                case exports.string.concat:
                    return _itemFieldString.concat(args[0]);

                case exports.date.day:
                    return _itemFieldDate && _itemFieldDate.day();
                case exports.date.hour:
                    return _itemFieldDate && _itemFieldDate.hour();
                case exports.date.minute:
                    return _itemFieldDate && _itemFieldDate.minute();
                case exports.date.month:
                    return _itemFieldDate && _itemFieldDate.month();
                case exports.date.second:
                    return _itemFieldDate && _itemFieldDate.second();
                case exports.date.year:
                    return _itemFieldDate && _itemFieldDate.year();

                case exports.math.round:
                    return Math.round(_itemFieldNumber);
                case exports.math.floor:
                    return Math.floor(_itemFieldNumber);
                case exports.math.ceiling:
                    return Math.ceil(_itemFieldNumber);

                case exports.type.isof:
                    return ko.utils.unwrapObservable(item["odata.type"]) === args[0];
                case exports.type.propisof:
                    return true;
            }
        };

        FunctionFilter.prototype.formatField = function () {
            var fn = this.fn(), args = this.args();

            args = _.isArray(args) ? ko.toJS(args) : [args];

            if (_.contains([exports.string.substringof, exports.string.endswith, exports.string.startswith, exports.string.indexof], fn) && (!args.length || !args[0]))
                return null;

            args = _.map(args, this.formatValue, this);
            return spa.format.apply(null, _.union([fn, this._field()], args));
        };
        return FunctionFilter;
    })(Filter);
    exports.FunctionFilter = FunctionFilter;

    var Ordering = (function () {
        function Ordering(field, ascending) {
            this.field = utils.createObservable(field);
            this.ascending = utils.createObservable(ascending, true);
        }
        /** Creates a String acceptable for odata Query String $orderby */
        Ordering.prototype.toQueryString = function () {
            return spa.format("{0} {1}", this.field(), this.ascending() ? "asc" : "desc");
        };

        /** Create a sorting function to sort entities locally */
        Ordering.prototype.toSortFunction = function () {
            var field = this.field(), asc = this.ascending();

            return function (item1, item2) {
                var itemField1 = ko.utils.unwrapObservable(item1[field]);
                var itemField2 = ko.utils.unwrapObservable(item2[field]);

                if (itemField1 > itemField2)
                    return 1 * (asc ? 1 : -1);
                if (itemField1 < itemField2)
                    return -1 * (asc ? 1 : -1);
                return 0;
            };
        };
        return Ordering;
    })();
    exports.Ordering = Ordering;

    var ODataQuery = (function () {
        function ODataQuery(options) {
            options = _.extend({ pageNum: 0, pageSize: 0, orderBy: [], filters: [], includeDeleted: false, total: false }, options || {});

            this.pageNum = utils.createObservable(options.pageNum);
            this.pageSize = utils.createObservable(options.pageSize);
            this.ordersby = utils.createObservableArray(options.ordersBy);
            this.filters = utils.createObservableArray(options.filters);
            this.total = utils.createObservable(options.total, false);
            this.includeDeleted = utils.createObservable(options.includeDeleted, false);
        }
        ODataQuery.prototype.addFilter = function (field, type, value) {
            return this.where(field, type, value);
        };
        ODataQuery.prototype.addOrdering = function (field, ascending) {
            return this.orderby(field, ascending);
        };

        ODataQuery.prototype.where = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
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
                    filter = _.isArray(args[2]) ? new FunctionFilter(args[0], args[1], args[2]) : new Filter(args[0], args[1], args[2]);
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
        };

        /** Order by specified field */
        ODataQuery.prototype.orderby = function (field, ascending) {
            var order = this.ordersby._find(function (o) {
                return o.field() === ko.utils.unwrapObservable(field);
            });
            if (order) {
                if (order.ascending() !== ascending)
                    order.ascending(ascending);
            } else
                this.ordersby.push(new Ordering(field, ascending));

            return this;
        };

        ODataQuery.prototype.and = function () {
            this.filters.push(exports.operator.and);
            return this;
        };
        ODataQuery.prototype.or = function () {
            this.filters.push(exports.operator.or);
            return this;
        };

        /** Creates an OData Query string (includes $filter, $skip, $top, $orderby) */
        ODataQuery.prototype.toQueryString = function () {
            var qstring = [], filters = [], orders, lastIsFilter = false, showTotal = this.total(), pageNum = this.pageNum(), pageSize = this.pageSize();

            if ((pageNum !== 0 || pageSize !== 0) && this.ordersby._size() == 0)
                throw "You must specify atleast 1 order function when using paging";

            if (pageNum !== 0 && pageSize === 0)
                throw "You cannot specify a page number without a page size";

            _.each(this.filters(), function (filter) {
                if (_.isObject(filter)) {
                    var query = filter.toQueryString();
                    if (!utils.isNullOrWhiteSpace(query)) {
                        if (lastIsFilter)
                            filters.push(exports.operator.and);

                        filters.push(query);
                        lastIsFilter = true;
                    }
                } else if (_.isString(filter)) {
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

            if (pageNum) {
                qstring.push("$skip=" + (pageSize * (pageNum - 1)));
                showTotal = true;
            }
            if (pageSize) {
                qstring.push("$top=" + pageSize);
                showTotal = true;
            }

            orders = _.map(this.ordersby(), function (order) {
                return order.toQueryString();
            });

            if (orders.length)
                qstring.push("$orderby=" + orders.join(", "));

            if (showTotal === true) {
                qstring.push("$inlinecount=allpages");
            }

            return qstring.join("&");
        };

        /** Returns a function for local filtering */
        ODataQuery.prototype.toLocalFilter = function () {
            var filters = [], lastIsFilter = false;

            if (this.includeDeleted() !== true) {
                filters.push(function (e) {
                    return !ko.utils.unwrapObservable(e.IsRemoved);
                });
                filters.push(exports.operator.and);
            }

            _.each(this.filters(), function (filter) {
                if (_.isObject(filter)) {
                    if (lastIsFilter)
                        filters.push(exports.operator.and);

                    filters.push(filter.toUnderscoreQuery());
                    lastIsFilter = true;
                } else if (_.isString(filter)) {
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
                        } else if (_.isString(filter)) {
                            or = (filter === exports.operator.or);
                        }
                    });

                    return result;
                };
            }

            return null;
        };

        /** Returns a function for local sorting */
        ODataQuery.prototype.toLocalSorting = function () {
            var orders = _.map(this.ordersby(), function (order) {
                return order.toSortFunction();
            });
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
        };

        /** Filter specified array */
        ODataQuery.prototype.applyFilters = function (array) {
            var filter = this.toLocalFilter();
            return filter ? _.filter(array, filter) : array;
        };

        /** Sort specified array */
        ODataQuery.prototype.applySorting = function (array) {
            var sorter = this.toLocalSorting();
            return sorter ? array.sort(sorter) : array;
        };

        /** Apply paging to specified array */
        ODataQuery.prototype.applyPaging = function (array, correctPageNum) {
            if (typeof correctPageNum === "undefined") { correctPageNum = false; }
            var pageSize = this.pageSize();

            if (pageSize > 0) {
                var pageNum = this.pageNum() || 1, min = (pageNum - 1) * pageSize, max = pageNum * pageSize;

                if (array.length < min) {
                    if (correctPageNum) {
                        while (array.length < min) {
                            pageNum = pageNum - 1;

                            min = (pageNum - 1) * pageSize;
                            max = pageNum * pageSize;
                        }

                        this.pageNum(pageNum);
                    } else
                        return [];
                }

                if (max >= array.length)
                    max = array.length;

                array = array.slice(min, max);
            }

            return array;
        };

        /** Apply this query to specified array */
        ODataQuery.prototype.apply = function (array, correctPageNum) {
            if (typeof correctPageNum === "undefined") { correctPageNum = false; }
            array = this.applyFilters(array);
            array = this.applySorting(array);
            array = this.applyPaging(array, correctPageNum);

            return array;
        };
        return ODataQuery;
    })();
    exports.ODataQuery = ODataQuery;
});
