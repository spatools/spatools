define(["require", "exports", "./loader", "./base64", "./store"], function(require, exports, __loader__, __base64__, __store__) {
    
    var loader = __loader__;
    var base64 = __base64__;
    var store = __store__;

    var cacheKeyPrefix = "__SPA_CACHE__", cacheEntries = {}, memory = {}, deferreds = {}, doc = document, head = doc.head;

    //#region Public Methods
    /** Load a resource in cache */
    function load(key, url, mime, force) {
        if (typeof mime === "undefined") { mime = "text/plain"; }
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, mime, force);
    }
    exports.load = load;

    /** Load a script in cache */
    function loadScript(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "application/x-javascript", force).then(function (entry) {
            var deferred = $.Deferred(), script = doc.createElement('script');

            script.src = base64.createDataURL("application/x-javascript", entry.content);
            script.setAttribute("name", key);
            script.onload = deferred.resolve;
            script.onerror = deferred.reject;

            head.appendChild(script);

            return deferred.promise();
        });
    }
    exports.loadScript = loadScript;

    /** Load a style in cache */
    function loadStyle(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/css", force).then(function (entry) {
            return base64.decode(entry.content);
        }).then(loader.loadStyle);
    }
    exports.loadStyle = loadStyle;

    /** >Load a style sheet in cache */
    function loadStylesheet(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/css", force).then(function (entry) {
            return base64.createDataURL("text/css", entry.content);
        }).then(loader.loadStylesheet);
    }
    exports.loadStylesheet = loadStylesheet;

    /** Load an HTML fragment in cache */
    function loadHTML(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/html", force).then(function (entry) {
            return base64.decode(entry.content);
        });
    }
    exports.loadHTML = loadHTML;

    /** Load an JSON result in cache */
    function loadJSON(key, url, force) {
        if (typeof force === "undefined") { force = false; }
        return cache(key, url, "text/json", force).then(function (entry) {
            return JSON.parse(base64.decode(entry.content));
        });
    }
    exports.loadJSON = loadJSON;

    //#endregion
    //#region Private Methods
    function cache(key, url, mime, force) {
        if (cacheEntries[key] === true && !force)
            return $.when(memory[key]); else
            return downloadAndEncode(key, url, mime);
    }

    function downloadAndEncode(key, url, mime) {
        if (!deferreds[key]) {
            cacheEntries[key] = false;
            deferreds[key] = $.ajax({ url: url, dataType: "text" }).then(function (content) {
                memory[key] = {
                    key: key,
                    mime: mime,
                    url: url,
                    content: base64.encode(content)
                };

                cacheEntries[key] = true;
                delete deferreds[key];
                save();

                return memory[key];
            });
        }

        return deferreds[key];
    }

    function save() {
        var entries = _.filterMap(cacheEntries, function (value, key) {
            if (value === true)
                return key;
        });
        store.setItem(cacheKeyPrefix, JSON.stringify(entries));

        _.each(memory, function (value, key) {
            store.setItem(cacheKeyPrefix + key, JSON.stringify(value));
        });
    }

    //#endregion
    var entries = JSON.parse(store.getItem(cacheKeyPrefix)) || [];
    _.each(entries, function (key) {
        return cacheEntries[key] = true;
    });
    _.each(entries, function (key) {
        return memory[key] = JSON.parse(store.getItem(cacheKeyPrefix + key));
    });
});
