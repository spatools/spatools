/// <reference path="../_definitions.d.ts" />

import utils = require("../utils");
import event = require("../event");
import engine = require("./templateEngine");
import ui = require("../ui");

function getBestStep(value: number, step: number): number {
    if (!step)
        return value;

    var rest = value % step,
        upper = rest >= step / 2;

    return upper ? value + (step - rest) : value - rest;
}

export interface SliderOptions {
    value?: any;
    min?: any;
    max?: any;
    step?: any;
}

export class Slider {
    private element: Element;
    private $element: JQuery;
    private $handle: JQuery;
    private isMouseDown: boolean = false;

    private elementWidth: KnockoutObservable<number> = ko.observable(0);
    private handleWidth: KnockoutObservable<number> = ko.observable(0);

    public value: KnockoutObservable<number>;
    public min: KnockoutObservable<number>;
    public max: KnockoutObservable<number>;
    public step: KnockoutObservable<number>;
    public coef: KnockoutComputed<number>;
    public position: KnockoutComputed<number>;

    constructor(value: number);
    constructor(value: KnockoutSubscribable<number>);
    constructor(options: SliderOptions);
    constructor(options: any) {
        if (!_.isObject(options) || ko.isSubscribable(options))
            options = { value: options };

        this.value = utils.createObservable(options.value, 0);
        this.min = utils.createObservable(options.min, 0);
        this.max = utils.createObservable(options.max, 1);
        this.step = utils.createObservable(options.step, 0.01);

        this.coef = ko.computed({
            read: function (): number {
                var max = this.max(),
                    min = this.min(),
                    val = this.value();

                if (min !== 0 || max !== 1)
                    val = (val - min) / (max - min);

                return val;
            },
            write: function (newCoef: number) {
                var max = this.max(),
                    min = this.min();

                if (min !== 0 || max !== 1)
                    newCoef = ((max - min) * newCoef) + min;

                this.value(getBestStep(newCoef, this.step()));
            },
            owner: this
        });

        this.position = ko.computed({
            read: function (): number {
                var coef = this.coef();
                this.updateWidths();
                return Math.round((coef * this.elementWidth()) - (this.handleWidth() * coef));
            },
            write: function (pos: number) {
                this.updateWidths();
                this.coef(pos / this.elementWidth());
            },
            owner: this,
            deferEvaluation: true
        });

        _.bindAll(this, "afterRender", "onMouseDown", "onMouseMove", "onMouseUp");
    }

    public init(element: Element): void {
        this.element = element;
        this.$element = $(element);
    }
    public afterRender(): void {
        this.$handle = this.$element.find(".ui-slider-handle");
        this.updateWidths();
    }

    public onMouseDown(e: MouseEvent): void {
        this.isMouseDown = true;
            
        var pos = this.getRelativePosition(e.pageX, e.pageY);
        this.position(pos.x);
    }
    public onMouseMove(e: MouseEvent): void {
        if (!this.isMouseDown)
                return;

        var pos = this.getRelativePosition(e.pageX, e.pageY);
        this.position(pos.x);
    }
    public onMouseUp(e: MouseEvent): void {
        this.isMouseDown = false;
    }

    private updateWidths(): void {
        this.$element && this.elementWidth(this.$element.width());
        this.$handle && this.handleWidth(this.$handle.width());
    }
    private getRelativePosition(x: number, y: number): utils.Point {
        var offset = this.$element.offset();

        return {
            x: x - offset.left,
            y: y - offset.top
        };
    }
}

ui.addTemplate("text!ui-slider-template.html", 
	"<div class=\"ui-slider\">" +
		"<div class=\"ui-slider-bar\">" +
            "<div class=\"ui-slider-handle\" data-bind=\"style: { left: position }\"></div>" +
		"</div>" +
		"<div class=\"ui-slider-overlay\" data-bind=\"sliderEvents: true\"></div>" +
	"</div>", engine.defaultInstance);

ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var slider = ko.utils.unwrapObservable(valueAccessor());

        if (!(slider instanceof Slider))
            slider = element._slider = new Slider(slider);

        slider.init(element);

        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var slider = element._slider || ko.utils.unwrapObservable(valueAccessor());
        ko.renderTemplate("text!ui-slider-template.html", slider, { templateEngine: engine.defaultInstance, afterRender: slider.afterRender }, element);
    }
};

ko.bindingHandlers.sliderEvents = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        event.attach(element, "mousedown touchstart", viewModel.onMouseDown);
        event.attach(element, "mousemove touchmove", viewModel.onMouseMove);
        event.attach(element, "mouseup mouseout touchend touchcancel", viewModel.onMouseUp);
    }
};