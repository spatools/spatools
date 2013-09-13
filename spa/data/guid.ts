/// <reference path="_data.d.ts" />

import utils = require("../utils");
var lastEmpty = 0,
    tempRegex = /00000000-0000-0000-0000-\d{12}/,
    guidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

export var empty = "00000000-0000-0000-0000-000000000000";

function S4(): string {
    return Math.floor(Math.random() * 0x10000 /* 65536 */ ).toString(16);
}

export function generate(): string {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export function generateTemp(): string {
    return "00000000-0000-0000-0000-" + utils.str_pad((lastEmpty++).toString(), 12, "0");
}

export function isTemp(guid: string): boolean {
    return tempRegex.test(guid);
}

export function isGuid(guid: string): boolean {
    return guidRegex.test(guid);
}