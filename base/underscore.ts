/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />

//#region UndescoreJS Extension

declare module _ {
    export function sum<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    export function average<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    export function count<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    export function filterMap<T, TResult>(collection: { [key: string]: T }, iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    export function filterMap<T, TResult>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    export function index<T>(collection: T[], iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    export function partialEnd<T>(func: () => T, ...args: any[]): () => T;
}

var p = Array.prototype;

_.mixin({
    sum: function <T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number {
        /// <summary>Sum each item of given array by using specified iterator function</summary>
        /// <param name="collection" type="Array">Array to sum in</param>
        /// <param name="iterator" type="Function">Function which return operand for sum</param>
        /// <param name="context" type="Object" optional="true">Context to bind iterator function</param>
        /// <returns type="Number">Sum of result obtained by iterator method against each array element</returns>

        var result = 0;

        _.each(collection, function (item, index?, list?) {
            result += iterator.call(context, item, index, list);
        });

        return result;
    },
    average: function <T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number {
        /// <summary>Create average from each item of given array by using specified iterator function</summary>
        /// <param name="collection" type="Array">Array to average items</param>
        /// <param name="iterator" type="Function">Function which return operand for average</param>
        /// <param name="context" type="Object" optional="true">Context to bind iterator function</param>
        /// <returns type="Number">Average of result obtained by iterator method against each array element</returns>

        var sum = 0,
            count = 0;

        _.each(collection, function (item, index?, list?) {
            sum += iterator.call(context, item, index, list);
            count++;
        });

        return sum / count;
    },
    count: function <T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): number {
        /// <summary>Count items in given collection filtered by given iterator function</summary>
        /// <param name="collection" type="Array">Array to count items</param>
        /// <param name="iterator" type="Function">Function which filter array items</param>
        /// <param name="context" type="Object" optional="true">Context to bind iterator function</param>
        /// <returns type="Number">Items count</returns>

        if (!iterator)
            return _.size(collection);

        return _.filter(collection, iterator, context).length;
    },
    filterMap: function <T, TResult>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[] {
        /// <summary>Select is a mapping and filtering function, iterator can map or return false or undefined to filter items</summary>
        /// <param name="collection" type="Array">Array to select items</param>
        /// <param name="iterator" type="Function">Function which filter and map items</param>
        /// <param name="context" type="Object" optional="true">Context to bind iterator function</param>
        /// <returns type="Array">Array of mapped and filtered items</returns>

        var result = [];

        _.each(collection, function (item, index?, list?) {
            var _item = iterator.call(context, item, index, list);
            if (_item) result.push(_item);
        });

        return result;
    },
    index: function <T>(collection: T[], iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): number {
        /// <summary>Get index of first item with which iterator function return true</summary>
        /// <param name="collection" type="Array">Array to search</param>
        /// <param name="iterator" type="Function">Function which filter items by returning true or false</param>
        /// <param name="context" type="Object" optional="true">Context to bind iterator function</param>
        /// <returns type="Number">Index of first element filtered by iterator methods</returns>

        var result = -1;
        _.find(collection, function (value, index?) {
            if (iterator.apply(context, arguments) === true) {
                result = index;
                return true;
            }

            return false;
        });

        return result;
    },
    partialEnd: function <T>(func: () => T, ...args: any[]): () => T {
        return function () {
            return func.apply(this, p.slice.call(arguments).concat(args));
        };
    }
});

//#endregion

//#region UnderscoreJS integration with KnockoutJS

interface KnockoutUnderscoreArrayFunctions {
    each<T>(iterator: (element: T, index?: number, list?: T[]) => void , context?: any): KnockoutComputed<void>;
    map<T, TResult>(iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): KnockoutComputed<TResult[]>;
    filterMap<T, TResult>(iterator?: (element: T, index?: number, list?: T[]) => TResult, context?: any): KnockoutComputed<TResult[]>;
    reduce<T, TResult>(iterator: (memo: TResult, element: T, index?: number, list?: T[]) => TResult, memo: TResult, context?: any): KnockoutComputed<TResult>;
    find<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T>;
    filter<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T[]>;
    reject<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T[]>;
    sum<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<number>;
    average<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<number>;
    all<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<boolean>;
    any<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<boolean>;
    contains<T>(value: T): boolean;
    max<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<T>;
    min<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<T>;
    sortBy<T, TSort>(iterator: (element: T, index?: number, list?: T[]) => TSort, context?: any): KnockoutComputed<T[]>;
    groupBy<T>(iterator: (element: T, index?: number, list?: T[]) => string, context?: any): KnockoutComputed<{ [key: string]: any[]; }>;
    toArray(): any[];
    count<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<number>;
    index<T>(iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<number>;
    size(): KnockoutComputed<number>;
    first<T>(): KnockoutComputed<T>;
    last<T>(): KnockoutComputed<T>;
    initial<T>(n?: number): KnockoutComputed<T[]>;
    rest<T>(index?: number): KnockoutComputed<T[]>;
    compact<T>(): KnockoutComputed<T[]>;
    flatten(shallow?: boolean): KnockoutComputed<any>;
    without<T>(...values: T[]): KnockoutComputed<T[]>;
    union<T>(...arrays: T[][]): KnockoutComputed<T[]>;
    intersection<T>(...arrays: T[][]): KnockoutComputed<T[]>;
    difference<T>(...others: T[][]): KnockoutComputed<T[]>;
    uniq<T, TSort>(isSorted?: boolean, iterator?: (element: T, index?: number, list?: T[]) => TSort, context?: any): KnockoutComputed<T[]>;
    zip(...arrays: any[][]): KnockoutComputed<any[][]>;
    indexOf<T>(value: T, isSorted?: boolean): KnockoutComputed<number>;
    lastIndexOf<T>(value: T, from?: number): KnockoutComputed<number>;

    _each<T>(iterator: (element: T, index?: number, list?: T[]) => void , context?: any): void;
    _map<T, TResult>(iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    _filterMap<T, TResult>(iterator?: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    _reduce<T, TResult>(iterator: (memo: TResult, element: T, index?: number, list?: T[]) => TResult, memo: TResult, context?: any): TResult;
    _find<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T;
    _filter<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T[];
    _reject<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T[];
    _sum<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    _average<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    _all<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): boolean;
    _any<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): boolean;
    _contains<T>(value: T): boolean;
    _max<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): T;
    _min<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): T;
    _sortBy<T, TSort>(iterator: (element: T, index?: number, list?: T[]) => TSort, context?: any): T[];
    _groupBy<T>(iterator: (element: T, index?: number, list?: T[]) => string, context?: any): { [key: string]: any[]; };
    _toArray(): any[];
    _count<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    _index<T>(iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    _size(): number;
    _first<T>(): T;
    _last<T>(): T;
    _initial<T>(n?: number): T[];
    _rest<T>(index?: number): T[];
    _compact<T>(): T[];
    _flatten(shallow?: boolean): any;
    _without<T>(...values: T[]): T[];
    _union<T>(...arrays: T[][]): T[];
    _intersection<T>(...arrays: T[][]): T[];
    _difference<T>(...others: T[][]): T[];
    _uniq<T, TSort>(isSorted?: boolean, iterator?: (element: T, index?: number, list?: T[]) => TSort, context?: any): T[];
    _zip(...arrays: any[][]): any[][];
    _indexOf<T>(value: T, isSorted?: boolean): number;
    _lastIndexOf<T>(value: T, from?: number): number;
}

interface KnockoutObservableArrayFunctions extends KnockoutUnderscoreArrayFunctions {
    indexOf<T>(value: T, isSorted?: boolean): KnockoutComputed<number>;
    lastIndexOf<T>(value: T, from?: number): KnockoutComputed<number>;
}

interface KnockoutUnderscoreObjectsFunctions {
    keys(): KnockoutComputed<string[]>;
    values(): KnockoutComputed<any[]>;
    clone<T>(object: T): KnockoutComputed<T>;
    isEmpty(object: any): KnockoutComputed<boolean>;

    _keys(): string[];
    _values(): any[];
    _clone<T>(object: T): T;
    _isEmpty(object: any): boolean;
}

module spa {
    export var underscore = {
        objects: {},
        collections: {}
    };

    _.each(["keys", "values", "clone", "isEmpty"], function (method) {
        underscore.objects[method] = function () {
            var args = arguments;
            return ko.computed(function () {
                return this['_' + method].apply(this, args);
            }, this);
        },
        underscore.objects['_' + method] = function () {
            p.unshift.call(arguments, this());
            return _[method].apply(_, arguments);
        };
    });
    _.each(["each", "map", "filterMap", "reduce", "find", "filter", "reject", "sum", "average", "all", "any", "contains", "max", "min", "sortBy", "groupBy", "toArray", "count", "size", "index"], function (method) {
        underscore.collections[method] = function () {
            var args = arguments;
            return ko.computed(function () {
                return this['_' + method].apply(this, args);
            }, this);
        };
        underscore.collections['_' + method] = function () {
            p.unshift.call(arguments, this());
            return _[method].apply(_, arguments);
        };
    });
    _.each(["first", "initial", "last", "rest", "compact", "flatten", "without", "union", "intersection", "difference", "uniq", "zip", "indexOf", "lastIndexOf"], function (method) {
        underscore.collections[method] = function () {
            var args = arguments;
            return ko.computed(function () {
                return this['_' + method].apply(this, args);
            }, this);
        };
        underscore.collections['_' + method] = function () {
            var value = this();
            p.unshift.call(arguments, _.isArray(value) ? value : _.values(value));
            return _[method].apply(_, arguments);
        };
    });

    ko.utils.extend(ko.observableArray.fn, underscore.collections);
}

//#endregion

