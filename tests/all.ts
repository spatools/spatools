/// <reference path="../_references.d.ts" />
/// <reference path="../scripts/typings/qunit/qunit.d.ts" />

//QUnit.log(details => {
//    if (window.console && window.console.log) {
//        window.console.log(details);
//    }
//});

requirejs.config({
    //deps: ["../spa/main"],

    jQuery: true,

    paths: {
        'text': '../../scripts/text'
    }
});

var modules = [
    "base",
    "base64",
    "changeTracker",
    "commands",
    "messenger",
    "path",
    "store",
    "timers",
    "utils",
    "data/guid",
    "data/query",
    "data/mapping"
];

require(["../spa/main"], () => {
    require(modules, () => {
        QUnit.start();

        _.each(arguments, test => test.run());
    });
});
