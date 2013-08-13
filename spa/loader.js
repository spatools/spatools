define(["require", "exports"], function(require, exports) {
    /// <reference path="_definitions.d.ts" />
    var doc = document, head = doc.head, interval = 10, timeout = 150000, cssRules, sheet;

    /** Load script document by url */
    function loadScript(url) {
        return $.ajax({ url: url, dataType: "script" });
    }
    exports.loadScript = loadScript;

    /** Load specified style into current page */
    function loadStyle(css) {
        return $.Deferred(function (dfd) {
            var style = doc.createElement("style");
            style.type = "text/css";

            try  {
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(doc.createTextNode(css));
                }

                setTimeout(function () {
                    head.appendChild(style);
                    dfd.resolve();
                }, 1);
            } catch (e) {
                dfd.reject();
            }
        }).promise();
    }
    exports.loadStyle = loadStyle;

    /** Load specified stylesheet by url */
    function loadStylesheet(url) {
        return $.Deferred(function (dfd) {
            var link = doc.createElement("link");

            link.rel = "stylesheet";
            link.type = "text/css";
            link.media = "all";
            link.href = url;

            var timeoutId = setTimeout(function () {
                dfd.reject(url);
            }, timeout), intervalId = setInterval(_.partial(checkStyleSheetLoaded, url, link, dfd), interval), id;

            if (!sheet) {
                cssRules = 'cssRules';
                sheet = 'sheet';
                if (!(sheet in link)) {
                    cssRules = 'rules';
                    sheet = 'styleSheet';
                }
            }

            if ('onload' in link)
                link.onload = function () {
                    return dfd.resolve(url);
                };
            if ('onerror' in link)
                link.onerror = function () {
                    return dfd.reject(url);
                };
            if ('onreadystatechange' in link)
                link.onreadystatechange = function () {
                    if (this.readyState == 'complete' || this.readyState == 'loaded')
                        return link[sheet][cssRules].length ? dfd.resolve(url) : dfd.reject(url);
                };

            id = setTimeout(function () {
                clearTimeout(id);
                id = null;
                head.appendChild(link);
            }, 1);

            dfd.always(function () {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                if ('onload' in link)
                    link.onload = null;
                if ('onreadystatechange' in link)
                    link.onreadystatechange = null;
            });
        }).promise();
    }
    exports.loadStylesheet = loadStylesheet;

    function checkStyleSheetLoaded(url, element, deferred) {
        try  {
            element && element[sheet] && element[sheet][cssRules].length && deferred.resolve(url);
        } catch (e) {
            return false;
        }
    }
});
