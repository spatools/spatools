/// <reference path="../_references.d.ts" />
/// <reference path="../build/spatools.d.ts" />
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />

//QUnit.log(details => {
//    if (window.console && window.console.log) {
//        window.console.log(details);
//    }
//});

requirejs.config({
    //jQuery: true,
    paths: {
        'text': '../../Scripts/text'
    }
});

var modules = [
    "base64",
    "changeTracker",
    "commands",
    "messenger",
    "path",
    "store",
    "timers",
];

require(modules, function () {
    QUnit.start();

    _.each(arguments, test => test.run());
});
