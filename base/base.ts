/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />
module spa {
    /** Create value accessor for custom bindings. */
    export function createAccessor<T>(value: T): () => T {
        return () => value;
    }

    /** Format text by using a format template */
    export function format(text: string, ...args: any[]): string {
        return text.replace(/\{+-?[0-9]+(:[^}]+)?\}+/g, function (tag) {
            var match = tag.match(/(\{+)(-?[0-9]+)(:([^\}]+))?(\}+)/),
                index = parseInt(match[2], 10),
                value = args[index];

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
}