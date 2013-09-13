/// <reference path="_definitions.d.ts" />

//#region UndescoreJS Extension

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
        _.find(collection, function (value, index?): boolean {
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

export var objects: { [key: string]: Function } = {};
export var collections: { [key: string]: Function } = {};

_.each(["keys", "values", "clone", "isEmpty"], function (method: string) {
    objects[method] = function () {
        var args = arguments;
        return ko.computed(function () {
            return this['_' + method].apply(this, args);
        }, this);
    },
    objects['_' + method] = function () {
        p.unshift.call(arguments, this());
        return _[method].apply(_, arguments);
    };
});
_.each(["each", "map", "filterMap", "reduce", "find", "filter", "reject", "sum", "average", "all", "any", "contains", "max", "min", "sortBy", "groupBy", "toArray", "count", "size", "index"], function (method: string) {
    collections[method] = function () {
        var args = arguments;
        return ko.computed(function () {
            return this['_' + method].apply(this, args);
        }, this);
    };
    collections['_' + method] = function () {
        p.unshift.call(arguments, this());
        return _[method].apply(_, arguments);
    };
});
_.each(["first", "initial", "last", "rest", "compact", "flatten", "without", "union", "intersection", "difference", "uniq", "zip", "indexOf", "lastIndexOf"], function (method: string) {
    collections[method] = function () {
        var args = arguments;
        return ko.computed(function () {
            return this['_' + method].apply(this, args);
        }, this);
    };
    collections['_' + method] = function () {
        var value = this();
        p.unshift.call(arguments, _.isArray(value) ? value : _.values(value));
        return _[method].apply(_, arguments);
    };
});

export function addToObservableArrays(): void {
    ko.utils.extend(ko.observableArray.fn, collections);
}

export function addToSubscribable<T>(val: KnockoutSubscribable<T>): void {
    ko.utils.extend(val, collections);
}

//#endregion

