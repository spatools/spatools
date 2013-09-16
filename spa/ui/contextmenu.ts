/// <reference path="../_definitions.d.ts" />

import utils = require("../utils");
import engine = require("./templateEngine");
import ui = require("../ui");

export var defaults = {
    cssClass: 'ui-context',
    width: 190
};

export interface IMenuContainer {
    cssClass: KnockoutObservable<string>;
}

//#region Context Menu

export interface ContextMenuConfiguration {
    name?: any;
    cssClass?: any;
    width?: any;
    items: any;
}

export class ContextMenu implements IMenuContainer{
    private container: IMenuContainer;
    public engine = engine.defaultInstance;

    public name: KnockoutObservable<string>;
    public cssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public zIndex: number;

    public items: KnockoutObservableArray<ContextMenuItem> = ko.observableArray<ContextMenuItem>();

    constructor(data: ContextMenuConfiguration, container?: IMenuContainer) {
        this.container = container;

        this.cssClass = utils.createObservable(data.cssClass, container ? container.cssClass() : defaults.cssClass);
        this.width = utils.createObservable(data.width, defaults.width);
        this.name = utils.createObservable(data.name, '');

        for (var i in data.items) {
            var item = data.items[i];
            this.items.push(new ContextMenuItem(item, this));
        }
    }
}

//#endregion

//#region Context Menu Item

export interface ContextMenuItemConfiguration {
    text?: any;
    iconCssClass?: any;
    separator?: any;
    run?: any;
    items?: any;
}

export class ContextMenuItem {
    private container: ContextMenu;
    private subMenu: ContextMenu;
    private dataItem: any = {};

    public text: KnockoutObservable<string>;
    public iconCssClass: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public separator: KnockoutObservable<boolean>;
    public disabled: KnockoutObservable<boolean>;

    public run: (dataItem?: any) => any;

    constructor(data: ContextMenuItemConfiguration, container: ContextMenu) {
        this.container = container;
        this.text = utils.createObservable(data.text, '');
        this.iconCssClass = utils.createObservable(data.iconCssClass, '');
        this.separator = utils.createObservable(data.separator, false);
        this.run = typeof data.run === 'function' ? data.run : eval(data.run);
        this.width = ko.observable(container.width());
        this.disabled = ko.observable(false);

        if (data.items !== undefined && data.items.length > 0) {
            this.subMenu = new ContextMenu({ items: data.items }, container);
        }
    }

    public hasChildren(): boolean {
        return !!this.subMenu;
    }

    public addDataItem(dataItem: any) {
        this.dataItem = dataItem;
        if (this.hasChildren()) {
            for (var i = 0; i < this.subMenu.items().length; i += 1) {
                this.subMenu.items()[i].addDataItem(dataItem);
            }
        }
    }

    public itemWidth(): string {
        return (this.separator() ? (this.width() - 4) : (this.width() - 6)) + 'px';
    }
    public labelWidth(): string {
        return (this.width() - 41) + 'px'; // icon + borders + padding
    }

    public onClick(e: Event) {
        if (this.disabled() || this.run === undefined) {
            return false;
        }

        this.run(this.dataItem);
        $('.ui-context').remove();
    }
}

//#endregion

//#region Context Menu Builder

export interface ContextMenuBuilderConfiguration {
    cssClass?: any;
    build: any;
    contextMenus: any;
}

export interface ContextMenuBuilderResult {
    name: string;
    disable?: string[];
}

export class ContextMenuBuilder implements IMenuContainer {
    public cssClass: KnockoutObservable<string>;
    public build: (e: Event, parentVM: any) => ContextMenuBuilderResult;

    public contextMenus: KnockoutObservableArray<ContextMenu> = ko.observableArray<ContextMenu>();

    constructor(configuration: ContextMenuBuilderConfiguration) {
        this.cssClass = utils.createObservable(configuration.cssClass, defaults.cssClass);
        this.build = typeof configuration.build === 'function' ? configuration.build : eval(configuration.build);

        for (var i in configuration.contextMenus) {
            var menu = configuration.contextMenus[i];
            this.contextMenus.push(new ContextMenu(menu, this));
        }
    }
}

//#endregion

//#region Templates

ui.addTemplate("text!contextmenu-item-template.html", "\
	<li data-bind=\"subcontextmenu: hasChildren(), click: onClick, clickBubble: false, css: { separator: separator, disabled: disabled }, style: { width : itemWidth() }\">\
		<span class=\"inner\">\
            <span class=\"icon-bar\"><span class=\"icon\" data-bind=\"classes: iconCssClass\"></span></span>\
            <label data-bind=\"css: { parent : hasChildren() }, style: { width : labelWidth() }, text: text\"></label>\
        </span>\
		<!-- ko if: hasChildren() -->\
			<div class=\"nocontext\" style=\"position:absolute;\" data-bind=\"css: container.cssClass()\">\
				<ul data-bind='template: { name: \"text!contextmenu-item-template.html\", foreach: subMenu.items, templateEngine: $root.engine }'></ul>\
			</div>\
		<!-- /ko -->\
	</li>", engine.defaultInstance);

ui.addTemplate("text!contextmenu-template.html", 
	"<div class=\"ui-context nocontext\" style=\"position:absolute;\" data-bind=\"css: cssClass, style: { width: width, zIndex: zIndex }\">" +
		"<ul data-bind='template: { name: \"text!contextmenu-item-template.html\", foreach: items, templateEngine: $root.engine }'></ul>" +
	"</div>", engine.defaultInstance);

    //#endregion


//#region Handlers

function getMaxZIndex($element: JQuery): number {
    var maxZ = 1;

    $element.parents().each(function () {
        var z = $(this).css('zIndex'),
            _z: number;

        if (z !== 'auto') {
            _z = parseInt(z, 10);
            if (_z > maxZ) {
                maxZ = _z;
            }
        }
    });

    return maxZ;
}

ko.bindingHandlers.contextmenu = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void {
        var $element = $(element),
            menuContainer: JQuery, config: ContextMenuBuilderResult, menu: ContextMenu,
            parentVM = viewModel, value = ko.utils.unwrapObservable(valueAccessor());

        if (!value) return;

        $element
            .addClass('nocontext')
            .on('contextmenu', function (e) {
                if (value instanceof ContextMenuBuilder) {
                    config = value.build(e, parentVM);
                    menu = value.contextMenus.find(x => x.name() === config.name);
                }
                else {
                    config = { name: value.name() };
                    menu = value;
                }
                
                // remove any existing menus active
                $('.ui-context').remove();

                if (menu !== undefined) {
                    menuContainer = $('<div></div>').appendTo('body');

                    menu.items.each((item: ContextMenuItem) => {
                        item.disabled(!!config.disable && config.disable.indexOf(item.text()) !== -1); // disable item if necessary
                        item.addDataItem(parentVM); // assign the data item
                    });

                    // calculate z-index
                    menu.zIndex = getMaxZIndex($element);

                    var afterRender = function (doms) {
                        $(doms).filter(".ui-context").position({ my: "left top", at: "left bottom", of: e, collision: "flip" });
                    };

                    ko.renderTemplate("text!contextmenu-template.html", menu, { afterRender: afterRender, templateEngine: engine.defaultInstance }, menuContainer.get(0), "replaceNode");
                }

                return false;
            });

        $('html').click(function () {
            $('.ui-context').remove();
        });
    }
};

ko.bindingHandlers.subcontextmenu = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void {
        var $element: JQuery = $(element),
            value: boolean = ko.utils.unwrapObservable(valueAccessor()),
            width: number = ko.utils.unwrapObservable(viewModel.width()),
            cssClass: string;

        if (value) {
            cssClass = '.' + viewModel.container.cssClass();
            $(cssClass, $element).hide();

            $element.hover(function () {
                var $parent = $(this);
                $(cssClass, $parent).first().toggle().position({ my: 'left top', at: 'right top', of: $parent, collision: 'flip' });
            });
        }
    }
};

//#endregion