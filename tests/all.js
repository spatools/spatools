/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />
//QUnit.log(details => {
//    if (window.console && window.console.log) {
//        window.console.log(details);
//    }
//});
requirejs.config({
    deps: ["../spa/main"],
    //jQuery: true,
    paths: {
        'text': '../../Scripts/text'
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
    "utils"
];

require(modules, function () {
    QUnit.start();

    _.each(arguments, function (test) {
        return test.run();
    });
});
