/// <reference path="../_definitions.d.ts" />

import utils = require("../utils");

//#region Private Methods 

function mapToRibbonItem(array: any) {
    if (_.isArray(array)) {
        return _.map(array, createRibbonItem);
    }
    else if (ko.isWriteableObservable(array) && array.map) {
        return array.map(createRibbonItem);
    }
    else if (ko.isComputed(array)) {
        return ko.computed(function () {
            return _.map(array(), createRibbonItem);
        });
    }
}

function createRibbonItem(item: any): RibbonItem {
    if (item instanceof RibbonItem)
        return item;

    switch (item.__.toLowerCase()) {
        case "button":
            return new RibbonButton(item);
        case "flyout":
            item.content = mapToRibbonItem(item.content);
            return new RibbonFlyout(item);
        case "list":
            return new RibbonList(mapToRibbonItem(item.content));
        case "checkbox":
            return new RibbonCheckbox(item);
        case "form":
            return new RibbonForm(mapToRibbonItem(item.content), item.inline);
        case "input":
            return new RibbonInput(item);
        case "slider":
            return new RibbonSlider(item);
        default:
            throw "unknown type";
    }
}

function getRibbonItemHandler(item: any): string {
    if (item instanceof RibbonButton)
        return "ribbonButton";
    if (item instanceof RibbonList)
        return "ribbonList";
    if (item instanceof RibbonForm)
        return "ribbonForm";
    if (item instanceof RibbonInput)
        return "ribbonInput";
    if (item instanceof RibbonCheckbox)
        return "ribbonCheckbox";
    if (item instanceof RibbonFlyout)
        return "ribbonFlyout";
    if (item instanceof RibbonSlider)
        return "ribbonSlider";
}

//#endregion

//#region Ribbon

export interface RibbonOptions {
    pages?: any;
    selectedPage?: any;
    isCollapsed?: any;
    isLocked?: any;
    backButtonIcon?: any;
    backButtonClick?: () => any;
    triggerResize?: any;
}

export class Ribbon {
    public pages: KnockoutObservableArray<RibbonPage>;
    public selectedPage: KnockoutObservable<RibbonPage>;

    public isCollapsed: KnockoutObservable<boolean>;
    public isLocked: KnockoutObservable<boolean>;
    public triggerResize: KnockoutObservable<boolean>;

    public backButtonIcon: KnockoutObservable<string>;
    public backButtonClick: () => any = function () { };

    constructor(options: RibbonOptions) {
        this.pages = utils.createObservableArray(options.pages, this.createPage);
        this.selectedPage = utils.createObservable(options.selectedPage);
        this.isCollapsed = utils.createObservable(options.isCollapsed, true);
        this.isLocked = utils.createObservable(options.isLocked, false);
        this.triggerResize = utils.createObservable(options.triggerResize, false);

        this.backButtonIcon = utils.createObservable(options.backButtonIcon, "");
        if (options.backButtonClick)
            this.backButtonClick = options.backButtonClick;

        if (this.triggerResize()) {
            this.isCollapsed.subscribe(() => {
                setTimeout(() => $(window).resize(), 1);
            });
        }
    }

    public selectPage(page: number): void;
    public selectPage(page: string): void;
    public selectPage(page: RibbonPage): void;
    public selectPage(page: any): void {
        if (this.isLocked())
            return;

        if (_.isNumber(page)) {
            var index = page;
            page = this.pages()[index];
        }
        else if (_.isString(page)) {
            var title = page;
            page = this.pages._find(p => ko.utils.unwrapObservable(p.title) === title);
        }

        if (page && page instanceof RibbonPage) {
            this.selectedPage(page);
            if (this.isCollapsed())
                page.show();
        }
    }

    public addPage(page: any, special?: boolean): void {
        page = this.createPage(page);

        special && this.removeSpecialPages();

        this.pages.push(page);

        special && this.selectPage(page);
    }

    public expand(): void {
        this.isCollapsed(!this.isCollapsed());
    }

    public removeSpecialPages(): void {
        var isSelected = false,
            selected = this.selectedPage();

        var toremove = this.pages._filterMap<RibbonPage, number>((p, i?) => {
            if (p === selected)
                isSelected = true;

            if (p.special() === true)
                return i;
        });

        _.each(toremove, i => this.pages.splice(i, 1));

        if (isSelected)
            this.selectPage(0);
    }

    private createPage(page: any): RibbonPage {
        if (page instanceof RibbonPage)
            return page;

        else return new RibbonPage(page);
    }
}

//#endregion

//#region Ribbon Page 

export interface RibbonPageOptions {
    title?: any;
    special?: any;
    groups?: any;
    pop?: any;
}

export class RibbonPage {
    public title: KnockoutObservable<string>;
    public special: KnockoutObservable<boolean>;
    public groups: KnockoutObservableArray<RibbonGroup>;
    public pop: KnockoutObservable<boolean>;

    constructor(options: RibbonPageOptions) {
        this.title = utils.createObservable(options.title, "Page Title");
        this.special = utils.createObservable(options.special, false);
        this.pop = utils.createObservable(options.pop, false);
        this.groups = utils.createObservableArray(options.groups, this.createGroup);
    }

    public show(): void {
        this.pop(true);
    }

    private createGroup(group: any): RibbonGroup {
        if (group instanceof RibbonGroup)
            return group;

        return new RibbonGroup(group);
    }
}

//#endregion

//#region Ribbon Group

export interface RibbonGroupOptions {
    title?: any;
    priority?: any;
    isCollapsed?: any;
    icon?: any;
    content?: any;
}

export class RibbonItem {}

export class RibbonGroup {
    public title: KnockoutObservable<string>;
    public priority: KnockoutObservable<number>;
    public isCollapsed: KnockoutObservable<boolean>;
    public icon: KnockoutObservable<string>;
    public content: KnockoutObservableArray<RibbonItem>;

    constructor(options: RibbonGroupOptions) {
        this.title = utils.createObservable(options.title, "Group Title");
        this.priority = utils.createObservable(options.priority, 0);
        this.isCollapsed = utils.createObservable(options.isCollapsed, false);
        this.icon = utils.createObservable(options.icon, "icon-base");
        this.content = utils.createObservableArray(options.content, createRibbonItem);
    }
}

//#endregion

//#region Ribbon Flyout 

export interface RibbonFlyoutOptions {
    title?: any;
    icon?: any;
    content?: any;
    selected?: any;
}

export class RibbonFlyout extends RibbonItem {
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public selected: KnockoutObservable<boolean>;
    public content: KnockoutObservableArray<RibbonItem>;

    constructor(options: RibbonFlyoutOptions) {
        this.title = utils.createObservable(options.title, "Flyout");
        this.icon = utils.createObservable(options.icon, "icon-base");
        this.selected = utils.createObservable(options.selected, false);
        this.content = utils.createObservableArray(options.content, createRibbonItem);

        super();
    }
}

//#endregion

//#region Ribbon Button

export interface RibbonButtonOptions {
    title?: any;
    icon?: any;
    selected?: any;
    click?: () => any;
}

export class RibbonButton extends RibbonItem {
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public selected: KnockoutObservable<boolean>;
    public click: () => any;

    constructor(options: RibbonButtonOptions) {
        this.title = utils.createObservable(options.title, "Button");
        this.icon = utils.createObservable(options.icon, "icon-base");
        this.selected = utils.createObservable(options.selected, false);
        this.click = options.click || function () { };

        super();
    }
}

//#endregion

//#region Ribbon List 

export class RibbonList extends RibbonItem {
    public items: KnockoutObservableArray<RibbonItem>;

    constructor(items: any) {
        this.items = utils.createObservableArray(items, createRibbonItem);

        super();
    }
}

export interface RibbonListItemOptions {
    title?: any;
    icon?: any;
    click?: () => any;
}

export class RibbonListItem extends RibbonItem {
    public title: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public click: () => any;
    
    constructor(options: RibbonListItemOptions) {
        this.title = utils.createObservable(options.title, "List Item");
        this.icon = utils.createObservable(options.icon, "icon-list-base");
        this.click = options.click || function () { };

        super();
    }
}

//#endregion

//#region Ribbon Form 

export interface RibbonFormOptions {
    items?: any;
    inline?: any;
}

export class RibbonForm extends RibbonItem {
    public items: KnockoutObservableArray<RibbonItem>;
    public inline: KnockoutObservable<boolean>;

    constructor(items: any, inline?: any) {
        this.items = utils.createObservableArray(items, createRibbonItem);
        this.inline = utils.createObservable(inline, false);

        super();
    }
}

export interface RibbonInputOptions {
    label?: any;
    icon?: any;
    type?: any;
    value?: any;
}

export class RibbonInput extends RibbonItem {
    public label: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public type: KnockoutObservable<string>;
    public value: KnockoutObservable<any>;

    constructor(options: RibbonInputOptions) {
        this.label = utils.createObservable(options.label, "");
        this.icon = utils.createObservable(options.icon, "");
        this.type = utils.createObservable(options.type, "text");
        this.value = utils.createObservable(options.value);

        super();
    }
}

//#endregion

//#region Ribbon Checkbox

export interface RibbonCheckboxOptions {
    label?: any;
    checked?: any;
}

export class RibbonCheckbox extends RibbonItem {
    public label: KnockoutObservable<string>;
    public checked: KnockoutObservable<boolean>;

    constructor(options: RibbonCheckboxOptions) {
        this.label = utils.createObservable(options.label, "Checkbox");
        this.checked = utils.createObservable(options.checked, false);

        super();
    }
}

//#endregion

//#region Ribbon Slider

export interface RibbonSliderOptions {
    label?: any;
    icon?: any;
    min?: any;
    max?: any;
    step?: any;
    value?: any;
}

export class RibbonSlider extends RibbonItem {
    public label: KnockoutObservable<string>;
    public icon: KnockoutObservable<string>;
    public min: KnockoutObservable<number>;
    public max: KnockoutObservable<number>;
    public step: KnockoutObservable<number>;
    public value: KnockoutObservable<any>;

    constructor(options: RibbonSliderOptions) {
        this.label = utils.createObservable(options.label, "");
        this.icon = utils.createObservable(options.icon, "");
        this.min = utils.createObservable(options.min, 0);
        this.max = utils.createObservable(options.max, 1);
        this.step = utils.createObservable(options.step, 0.05);
        this.value = utils.createObservable(options.value);

        super();
    }
}

//#endregion

//#region Handlers

ko.bindingHandlers.popOut = {
    update: function (element: HTMLElement, valueAccessor: () => any): void {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            visible = ko.utils.unwrapObservable(options.visible),
            enabled = ko.utils.unwrapObservable(options.enabled),
            parent = $(element).parents("li:first");


        if (enabled === true) {
            if (visible === true) {
                $(element).show();

                setTimeout(function () {
                    $(element).on("click.koPop", function (e) {
                        e.stopPropagation();
                        return false;
                    });

                    $('html').bind("click.koPop", function (e) {
                        if ($(e.target).closest(parent.get(0)).length === 0) {
                            options.visible(false);
                        }
                    });
                }, 1);
            }
            else {
                if ($(element).is(":visible")) { // TODO: corriger petite erreur
                    $(element).hide();

                    $("html").unbind("click.koPop");
                    $(element).unbind("click.koPop");
                }
            }
        }
    }
};

ko.bindingHandlers.ribbon = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var ribbon = ko.utils.unwrapObservable(valueAccessor());

        var container = $("<div>");
        var $ribbon = $("<div>").addClass("ribbon").attr("data-bind", "css: { locked: isLocked, collapsed: isCollapsed }").appendTo(container);
        var backButton = $("<a>").addClass("back-button").attr("data-bind", "click: backButtonClick").appendTo($ribbon);
        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: backButtonIcon").appendTo(backButton);

        var $actions = $("<div>").addClass("ribbon-actions").appendTo($ribbon);
        var $expand = $("<span>").attr("data-bind", "if: !isLocked()").appendTo($actions);
        $("<a>").addClass("expander").attr("data-bind", "click: expand, css: { expanded: !isCollapsed() }").appendTo($expand);

        var pages = $("<ul>").addClass("ribbon-pages").attr("data-bind", "foreach: pages").appendTo($ribbon);
        $("<li>").attr("data-bind", "ribbonPage: $data, css: { special: special, selected: $parent.selectedPage() == $data }").appendTo(pages);
        ribbon.selectedPage(_.first(ko.utils.unwrapObservable(ribbon.pages)));

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var ribbon = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, ribbon, {}, element, "replaceNode");
    }
};
ko.bindingHandlers.ribbonPage = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var page = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-page");
        var container = $("<div>");
        var a = $("<a>").addClass("ribbon-page-header").attr("data-bind", "click: function() { $root.selectPage.call($root, $data) }, text: title").appendTo(container);

        var groups = $("<ul>").addClass("ribbon-groups").attr("data-bind", "template: { if: $root.selectedPage() == $data, foreach: groups }, css: { collapsed: $root.isCollapsed }, popOut: { visible: $parent.pop, enabled: $root.isCollapsed }").appendTo(container);
        var group = $("<li>").attr("data-bind", "ribbonGroup: $data").appendTo(groups);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var page = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(page), {}, element);
    }
};
ko.bindingHandlers.ribbonGroup = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var group = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-group");
        var container = $("<div>");
        var title = $("<h3>").attr("data-bind", "text: title").appendTo(container);

        var items = $("<ul>").addClass("ribbon-content").attr("data-bind", "foreach: content").appendTo(container);
        var item = $("<li>").addClass("ribbon-group-item").attr("data-bind", "ribbonItem: $data").appendTo(items);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var group = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(group), {}, element);
    }
};
ko.bindingHandlers.ribbonList = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var list = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-list");
        var container = $("<div>");
        var ul = $("<ul>").addClass("ribbon-list-content").attr("data-bind", "foreach: items").appendTo(container);
        $("<li>").addClass("ribbon-list-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var list = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(list), {}, element);
    }
};
ko.bindingHandlers.ribbonForm = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var form = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-form");
        if (form.inline === true)
            $(element).addClass("ribbon-form-inline");

        var container = $("<div>");
        var ul = $("<ul>").addClass("ribbon-form-content").attr("data-bind", "foreach: items").appendTo(container);
        $("<li>").addClass("ribbon-form-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var form = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(form), {}, element);
    }
};

function flyoutAfterRender(nodes: any[]): void {
    var button = $(nodes[0]), ul = $(nodes[1]);
    button.on("click", function (event) {
        if (!ul.is(":visible")) {
            $('html').on("click", function (e) {
                ul.fadeOut();
                $("html").unbind("click");
            });
            $(".ribbon-flyout-content").fadeOut();
            var width = 0;
            ul.show()
                .children("li")
                .each(function () { width += $(this).outerWidth(true); })
                .end()
                .width(width)
                .hide()
                .fadeIn();

            event.stopPropagation();
        }
    });
    ul.on("click", function (event) {
        if (!$(event.target).is("button") && $(event.target).parents("button").length === 0) // si pas bouton empeche fermeture
            event.stopPropagation();
    });
}
ko.bindingHandlers.ribbonFlyout = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var flyout = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-flyout").addClass("ribbon-button");
        var container = $("<div>");
        var button = $("<button>").addClass("ribbon-flyout-button").attr("data-bind", "css: { selected: selected }").appendTo(container);
        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo(button);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo(button);
        $("<span>").addClass("ribbon-flyout-arrow").appendTo(button);

        var ul = $("<ul>").addClass("ribbon-flyout-content").attr("data-bind", "foreach: content").hide().appendTo(container);
        $("<li>").addClass("ribbon-flyout-item").attr("data-bind", "ribbonItem: $data").appendTo(ul);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var flyout = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(flyout), { afterRender: flyoutAfterRender }, element);
    }
};

ko.bindingHandlers.ribbonItem = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var data = ko.utils.unwrapObservable(valueAccessor()),
            handler = getRibbonItemHandler(data);

        return ko.bindingHandlers[handler].init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var data = ko.utils.unwrapObservable(valueAccessor()),
            handler = getRibbonItemHandler(data);

        ko.bindingHandlers[handler].update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.bindingHandlers.ribbonButton = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var button = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-button");
        var container = $("<div>");
        var bt = $("<button>").attr("data-bind", "click: click, css: { selected: selected }").appendTo(container);
        $("<span>").addClass("ribbon-icon").attr("data-bind", "classes: icon").appendTo(bt);
        $("<span>").addClass("ribbon-button-title").attr("data-bind", "text: title").appendTo(bt);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var button = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(button), {}, element);
    }
};
ko.bindingHandlers.ribbonCheckbox = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var checkbox = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-checkbox");
        var container = $("<div>");
        $("<label>").attr("data-bind", "text: label").appendTo(container);
        $("<input>").attr("type", "checkbox").attr("data-bind", "checked: checked").appendTo(container);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var checkbox = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(checkbox), {}, element);
    }
};
ko.bindingHandlers.ribbonInput = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var input = ko.utils.unwrapObservable(valueAccessor());
        var label = ko.utils.unwrapObservable(input.label);
        var icon = ko.utils.unwrapObservable(input.icon);
        var type = ko.utils.unwrapObservable(input.type || "text");
        var color = false;

        $(element).addClass("ribbon-input");
        var container = $("<div>");

        if (type === "color") {
            color = true;
            type = "text";
        }

        if (label || icon)
            $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo(container);

        var inputElement = null,
            inputBinding = "";

        if (type === "textarea") {
            inputElement = $("<textarea>").addClass('ribbon-textarea');
            inputBinding = "value: value";
        }
        else if (type === "select") {
            inputBinding = "value: value, options: options";

            if (input.optionsText)
                inputBinding += ", optionsText: optionsText";
            if (input.optionsValue)
                inputBinding += ", optionsValue: optionsValue";

            inputElement = $("<select>").addClass('ribbon-select');
        }
        else {
            inputElement = $("<input>").addClass('ribbon-input-' + type).attr({ type: type });

            if (type === "checkbox") {
                inputBinding = "checked: value";
            }
            else if (color) {
                inputBinding = "colorpicker: value";
            }
            else {
                inputBinding = "value: value";
            }
        }

        if (input.attr) {
            inputBinding += ", attr: attr";
        }

        if (input.valueUpdate) {
            inputBinding += ", valueUpdate: valueUpdate";
        }

        inputElement.attr("data-bind", inputBinding);
        inputElement.appendTo(container);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var input = ko.utils.unwrapObservable(valueAccessor()),
            _class = ko.utils.unwrapObservable(input.class);

        if (_class) {
            var classes = _class.split(' '), css = {};
            _.each(classes, _class => css[_class] = true);
            ko.bindingHandlers.css.update(element, utils.createAccessor(css), allBindingsAccessor, viewModel, bindingContext);
        }

        ko.renderTemplate(element, bindingContext.createChildContext(input), {}, element);
    }
};
ko.bindingHandlers.ribbonSlider = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var slider = ko.utils.unwrapObservable(valueAccessor());

        $(element).addClass("ribbon-slider");
        var container = $("<div>");

        if (slider.label || slider.icon)
            $("<label>").addClass("ribbon-label").attr("data-bind", "text: label, classes: icon").appendTo(container);

        $("<div>").addClass("ribbon-slider-handle").attr("data-bind", "slider: { min: min, max: max, step: step, value: value, slide: onSlide }").appendTo(container);

        new ko.templateSources.anonymousTemplate(element).nodes(container.get(0));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var slider = ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate(element, bindingContext.createChildContext(slider), {}, element);
    }
};

//#endregion