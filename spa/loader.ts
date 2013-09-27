/// <reference path="_definitions.d.ts" />

import utils = require("./utils");

var doc = document, head = doc.head,
    interval = 10, timeout = 150000,
    cssRules, sheet;

/** Load script document by url */
export function loadScript(url: string): JQueryXHR {
    return $.ajax({ url: url, dataType: "script" });
}

/** Load specified style into current page */
export function loadStyle(css: string): JQueryPromise<any> {
    return $.Deferred(function (dfd) {
        var style = doc.createElement("style");
        style.type = "text/css";

        try {
            if (style.styleSheet) {   // IE
                style.styleSheet.cssText = css;
            } else {                // the world
                style.appendChild(doc.createTextNode(css));
            }

            setTimeout(function () {
                head.appendChild(style);
                dfd.resolve();
            }, 1);
        }
        catch (e) {
            dfd.reject();
        }
    }).promise();
}

/** Load specified stylesheet by url */
export function loadStylesheet(url: string): JQueryPromise<string> {
    return utils.unsafe(() => {
        var dfd = $.Deferred<string>(),
            link = doc.createElement("link");

        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "all";
        link.href = url;

        var timeoutId = setTimeout(() => dfd.reject(url), timeout),
            intervalId = setInterval(_.partial(checkStyleSheetLoaded, url, link, dfd), interval);

        if (!sheet) { // only assign these once
            cssRules = "cssRules"; sheet = "sheet";
            if (!(sheet in link)) { // MSIE uses non-standard property names
                cssRules = "rules"; sheet = "styleSheet";
            }
        }

        if ("onload" in link) link.onload = () => dfd.resolve(url);
        if ("onerror" in link) link.onerror = () => dfd.reject(url);
        if ("onreadystatechange" in link) link.onreadystatechange = () => { if (link.readyState === "complete" || link.readyState === "loaded") return link[sheet][cssRules].length ? dfd.resolve(url) : dfd.reject(url); };
        
        dfd.always(() => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            if ("onload" in link) link.onload = null;
            if ("onreadystatechange" in link) link.onreadystatechange = null;
        });

        head.appendChild(link);

        return dfd.promise();
    });
}

function checkStyleSheetLoaded(url: string, element: HTMLLinkElement, deferred: JQueryDeferred<string>) {
    try { element && element[sheet] && element[sheet][cssRules].length && deferred.resolve(url); }
    catch (e) { return false; }
}
