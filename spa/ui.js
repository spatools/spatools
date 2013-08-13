define(["require", "exports", "./utils"], function(require, exports, __utils__) {
    /// <reference path="_definitions.d.ts" />
    var utils = __utils__;

    /** Add a knockout template into the current page */
    function addTemplate(id, template, engine) {
        if (engine && engine.addTemplate) {
            engine.addTemplate(id, template);
            return;
        }

        if ($('#' + id).length === 0) {
            utils.unsafe(function () {
                $("body").append('<script id="' + id + '" type="text/html">' + template + '</script>');
            });
        }
    }
    exports.addTemplate = addTemplate;
});
