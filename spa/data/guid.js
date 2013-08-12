define(["require", "exports", "../utils"], function(require, exports, __utils__) {
    /// <reference path="_data.d.ts" />
    var utils = __utils__;
    var lastEmpty = 0, tempRegex = /00000000-0000-0000-0000-\d{12}/, guidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

    function S4() {
        return Math.floor(Math.random() * 0x10000).toString(16);
    }

    function generate() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    exports.generate = generate;

    function generateTemp() {
        return "00000000-0000-0000-0000-" + utils.str_pad((lastEmpty++).toString(), 12, "0");
    }
    exports.generateTemp = generateTemp;

    function isTemp(guid) {
        return tempRegex.test(guid);
    }
    exports.isTemp = isTemp;

    function isGuid(guid) {
        return guidRegex.test(guid);
    }
    exports.isGuid = isGuid;
});
