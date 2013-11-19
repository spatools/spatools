/// <reference path="../_references.d.ts" />

import ctx = require("../spa/ui/contextmenu");

requirejs.config({
    jQuery: true,
    paths: {
        'text': '../../scripts/text'
    }
});

function handleMenuClick(viewModel: any): void {
    alert("You click menu item, check console to see params");
    console.log(viewModel);
}

export var items = ko.observableArray([
    { text: "Item #1" },
    { text: "Item #2" },
    { text: "Item #3" },
    { text: "Item #4" },
]);

export var menu = new ctx.ContextMenu({
    name: "test menu",
    items: [
        { text: "Add a new item", run: handleMenuClick },
        { text: "Edit this item", run: handleMenuClick },
        { text: "Copy this item", run: handleMenuClick },
        { separator: true },
        { text: "Delete this item", run: handleMenuClick },
    ]
});

ko.applyBindings({ items: items, menu: menu });