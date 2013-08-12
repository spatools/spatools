define(["require", "exports", "../utils", "./query"], function(require, exports, __utils__, ___query__) {
    /// <reference path="_data.d.ts" />
    var utils = __utils__;
    
    var _query = ___query__;

    //#endregion
    //#region Model
    /** Creates a data view for the given data set */
    function create(dataSet, query) {
        var self = {
            query: query || new _query.ODataQuery(),
            set: dataSet,
            lastResult: ko.observableArray()
        };

        var result = ko.computed(function () {
            if (self.query.pageSize() > 0 && !self.set.isSynchronized() && self.lastResult._size() > 0)
                return self.lastResult();

            return self.query.apply(self.set._toArray(), true);
        }).extend({ cnotify: utils.arrayEquals, deferEvaluation: true });

        ko.utils.extend(result, self);
        ko.utils.extend(result, exports.dataViewFunctions);

        return result;
    }
    exports.create = create;

    exports.dataViewFunctions = {
        /** Refresh the view from the server */
        refresh: function () {
            var self = this;
            return this.set.query(this.query, true).done(function (data) {
                if (self.query.pageSize() > 0)
                    self.lastResult(data);
            });
        },
        /** Load a remote entity by key */
        load: function (key) {
            return this.set.load(key);
        },
        /** Add entity to view, if buffer is false, entity will be instantly post on the server */
        add: function (entity) {
            return this.set.add(entity);
        },
        /** Update entity on view, if buffer is false, entity will be instantly put on the server */
        update: function (entity) {
            this.set.update(entity);
        },
        /** Remove entity from dataset, if buffer is false, entity will be instantly deleted on the server */
        remove: function (entity) {
            this.set.remove(entity);
        },
        findByKey: function (key) {
            return this.set.findByKey(key);
        },
        /** Save changes of an entity to the server */
        saveEntity: function (entity) {
            return this.set.saveEntity(entity);
        },
        /** Reset entity to its original state */
        resetEntity: function (entity) {
            this.set.resetEntity(entity);
        },
        /** Get a report of changes in the dataview */
        getChanges: function () {
            return _.groupBy(this(), function (e) {
                return e.EntityState();
            });
        },
        /** Commits all Pending Operations (PUT, DELETE, POST) */
        saveChanges: function () {
            /// <summary>Commits all Pending Operations (PUT, DELETE, POST)</summary>
            /// <returnss type="$.Deffered">return a deffered object for async operations</returnss>
            var changes = this.getChanges(), set = this.set, deferreds = [];

            _.each(changes.added, function (e) {
                deferreds.push(set._remoteCreate(e));
            });
            _.each(changes.modified, function (e) {
                deferreds.push(set._remoteUpdate(e));
            });
            _.each(changes.deleted, function (e) {
                deferreds.push(set._remoteRemove(e));
            });

            return $.when.apply($, deferreds);
        }
    };
    ko.utils.extend(exports.dataViewFunctions, spa.underscore.collections);
});
