/// <reference path="_definitions.d.ts" />

import utils = require("./utils");

/** Add a knockout template into the current page */
export function addTemplate(id: string, template: string, engine?: KnockoutTemplateEngine): void {
    if (engine && engine.addTemplate) {
        engine.addTemplate(id, template);
        return;
    }

    if ($('#' + id).length === 0) {
        utils.unsafe(function () {
            $("body").append('<script id="' + id + '" type="text/html">' + template + '</script>'); // create the template
        });
    }
}