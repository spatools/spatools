/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />
var spa;
(function (spa) {
    /** Create value accessor for custom bindings. */
    function createAccessor(value) {
        return function () {
            return value;
        };
    }
    spa.createAccessor = createAccessor;

    /** Format text by using a format template */
    function format(text) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        return text.replace(/\{+-?[0-9]+(:[^}]+)?\}+/g, function (tag) {
            var match = tag.match(/(\{+)(-?[0-9]+)(:([^\}]+))?(\}+)/), index = parseInt(match[2], 10), value = args[index];

            if (match[1].length > 1 && match[5].length > 1)
                return "{" + index + (match[3] || "") + "}";

            if (typeof value === 'undefined')
                value = "";

            if (match[3]) {
                switch (match[4]) {
                    case "U":
                        return value.toString().toUpperCase();
                    case "u":
                        return value.toString().toLowerCase();
                    default:
                        if (window.Globalize) {
                            return Globalize.format(value, match[4]);
                        }
                        break;
                }
            }

            return value;
        });
    }
    spa.format = format;
})(spa || (spa = {}));
