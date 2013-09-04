/// <reference path="../_references.d.ts" />

import editor = require("../spa/ui/editor");

requirejs.config({
    jQuery: true,
    paths: {
        'text': '../../Scripts/text'
    }
});

var defaultVal = "Maecenas nec ipsum sed sapien venenatis imperdiet et vitae nibh. In mattis lacus nibh, eget rutrum lectus dapibus sit amet. Donec tristique vel orci quis pharetra. Morbi mollis massa sit amet elit ornare pulvinar. Donec quis lectus molestie, fermentum sapien eget, sodales turpis. Cras sed arcu vitae turpis porta adipiscing. Etiam mattis quam ac dictum sagittis.";

export var simple = new editor.Editor({
    value: defaultVal,
});
export var minimal = new editor.Editor({
    value: defaultVal,
    buttonSet: "minimal"
});
export var advanced = new editor.Editor({
    value: defaultVal,
    buttonSet: "advanced"
});
export var full = new editor.Editor({
    value: defaultVal,
    buttonSet: "full"
});

ko.applyBindings({ simple: simple, minimal: minimal, advanced: advanced, full: full });