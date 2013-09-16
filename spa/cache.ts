/// <reference path="_definitions.d.ts" />

import loader = require("./loader");
import base64 = require("./base64");
import store = require("./store");

var cacheKeyPrefix: string = "__SPA_CACHE__",
    cacheEntries: { [key: string]: boolean } = {},
    memory: { [key: string]: any } = {},
    deferreds: { [key: string]: JQueryPromise<any> } = {},
    doc = document, head = doc.head;

//#region Public Methods

/** Load a resource in cache */
export function load(key: string, url: string, mime: string = "text/plain", force: boolean = false): JQueryPromise<any> {
    return cache(key, url, mime, force);
}

/** Load a script in cache */
export function loadScript(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "application/x-javascript", force)
        .then(function (entry) {
            var deferred = $.Deferred(),
                script = doc.createElement("script");

            script.src = base64.createDataURL("application/x-javascript", entry.content);
            script.setAttribute("name", key);
            script.onload = deferred.resolve;
            script.onerror = deferred.reject;

            head.appendChild(script);

            return deferred.promise();
        });
}

/** Load a style in cache */
export function loadStyle(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "text/css", force)
        .then((entry) => base64.decode(entry.content))
        .then(loader.loadStyle);
}

/** >Load a style sheet in cache */
export function loadStylesheet(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "text/css", force)
        .then((entry) => base64.createDataURL("text/css", entry.content))
        .then(loader.loadStylesheet);
}

/** Load an HTML fragment in cache */
export function loadHTML(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "text/html", force)
        .then((entry) => base64.decode(entry.content));
}

/** Load an JSON result in cache */
export function loadJSON(key: string, url: string, force: boolean = false): JQueryPromise<any> {
    return cache(key, url, "text/json", force)
        .then(entry => JSON.parse(base64.decode(entry.content)));
}

//#endregion

//#region Private Methods

function cache(key: string, url: string, mime: string, force?: boolean): JQueryPromise<any> {
    if (cacheEntries[key] === true && !force) {
        return $.when(memory[key]);
    } else {
        return downloadAndEncode(key, url, mime);
    }
}

function downloadAndEncode(key: string, url: string, mime: string): JQueryPromise<any> {
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

function save(): void {
    var entries = _.filterMap(cacheEntries, function (value, key?) { if (value === true) return key; });
    store.setItem(cacheKeyPrefix, JSON.stringify(entries));

    _.each(memory, function (value, key?) {
        store.setItem(cacheKeyPrefix + key, JSON.stringify(value));
    });
}

//#endregion

var entries = JSON.parse(store.getItem(cacheKeyPrefix)) || [];
_.each(entries, key => cacheEntries[key] = true);
_.each(entries, key => memory[key] = JSON.parse(store.getItem(cacheKeyPrefix + key)));
