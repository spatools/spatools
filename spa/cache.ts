/// <reference path="_definitions.d.ts" />

import loader = require("./loader");
import base64 = require("./base64");
import store = require("./store");
import utils = require("./utils");

var cacheKeyPrefix: string = "__SPA_CACHE__",
    deferreds: { [key: string]: JQueryPromise<CacheResult> } = {},
    doc = document, head = doc.head;

export interface CacheResult {
    key: string;
    mime: string;
    url: string;
    content: string;
    date: string;
}

//#region Public Methods

/** Reset entire cache resources */
export function reset(): JQueryPromise<void> {
    return utils.timeout().then(() => {
        var keys = [], key, dfds;
        for (var i = 0; i < store.length; i++) {
            key = store.key(i);
            if (key.indexOf(cacheKeyPrefix) !== -1)
                keys.push(key);
        }

        deferreds = {};

        dfds = _.map(keys, key => utils.timeout().then(() => store.removeItem(key)));
        return utils.whenAll(dfds);
    });
}

/** Load a resource in cache */
export function load(key: string, url: string, mime: string = "text/plain", force: boolean = false): JQueryPromise<CacheResult> {
    return cache(key, url, mime, force);
}

/** Load a script in cache */
export function loadScript(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "application/x-javascript", force).then(entry => {
        return utils.unsafe(() => {
            var deferred = $.Deferred(),
                script = doc.createElement("script");

            script.src = base64.createDataURL("application/x-javascript", entry.content);
            script.setAttribute("name", key);
            script.onload = deferred.resolve;
            script.onerror = deferred.reject;

            head.appendChild(script);

            return deferred.promise();
        });
    });
}

/** Load a style in cache */
export function loadStyle(key: string, url: string, force: boolean = false): JQueryPromise<void> {
    return cache(key, url, "text/css", force)
        .then(entry => base64.decode(entry.content))
        .then(loader.loadStyle);
}

/** >Load a style sheet in cache */
export function loadStylesheet(key: string, url: string, force: boolean = false): JQueryPromise<string> {
    return cache(key, url, "text/css", force)
        .then(entry => base64.createDataURL("text/css", entry.content))
        .then(loader.loadStylesheet);
}

/** Load an HTML fragment in cache */
export function loadHTML(key: string, url: string, force: boolean = false): JQueryPromise<string> {
    return cache(key, url, "text/html", force)
        .then(entry => base64.decode(entry.content));
}

/** Load an JSON result in cache */
export function loadJSON<T>(key: string, url: string, force: boolean = false): JQueryPromise<T> {
    return cache(key, url, "text/json", force)
        .then(entry => JSON.parse(base64.decode(entry.content)));
}

//#endregion

//#region Private Methods

function cache(key: string, url: string, mime: string, force?: boolean): JQueryPromise<CacheResult> {
    if (!deferreds[key]) {
        deferreds[key] = loadCache(key).then(result => {
            if (result && !force) {
                return result;
            }

            return downloadAndEncode(key, url, mime, result);
        }).always(() => { delete deferreds[key]; });
    }

    return deferreds[key];
}

function downloadAndEncode(key: string, url: string, mime: string, cache?: CacheResult): JQueryPromise<CacheResult> {
    var opts: JQueryAjaxSettings = { url: url, dataType: "text" };
    if (cache)
        opts.data = { date: cache.date };

    return $.ajax(opts).then(content => {
        if (!content && cache) {
            return cache;
        }

        cache = {
            key: key,
            mime: mime,
            url: url,
            content: base64.encode(content),
            date: new Date().toJSON()
        };

        return saveCache(key, cache).then(() => cache);
    });
}

function loadCache(key: string): JQueryPromise<CacheResult> {
    return utils.timeout().then(() => JSON.parse(store.getItem(cacheKeyPrefix + key)));
}

function saveCache(key: string, content: CacheResult): JQueryPromise<void> {
    return utils.timeout().then(() => {
        store.setItem(cacheKeyPrefix + key, JSON.stringify(content));
    });
}

//#endregion
