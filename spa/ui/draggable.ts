/// <reference path="../_definitions.d.ts" />

import utils = require("../utils");

var doc = document,
    $doc = $(doc),
    pointerEnabled = window.navigator.msPointerEnabled || window.navigator.pointerEnabled;

//#region Private Methods

function round(nb: number): number {
    return Math.round(nb * 100) / 100;
}

function getCoefficient(container: JQuery): number {
    var transform = container.get(0).transform;
    return transform ? transform.getAttrs().scale[0] : 1;
}

function getMousePosition(event: JQueryEventObject, container: JQuery): utils.Point {
    var offset = container.offset(),
        transform = container.get(0).transform,
        coef = getCoefficient(container),
        tmp, eX, eY;

    if ((<any>event.originalEvent).touches) {
        tmp = (<any>event.originalEvent).touches[0];
        eX = tmp.pageX;
        eY = tmp.pageY;
    }
    else if (pointerEnabled && (<any>event.originalEvent).pointerId) {
        tmp = (<MSPointerEvent>(<any>event).originalEvent).currentPoint.Position;
        eX = tmp.x;
        eY = tmp.y;
    }
    else {
        eX = event.pageX;
        eY = event.pageY;
    }

    return {
        x: (eX - offset.left) * (1 / coef),
        y: (eY - offset.top) * (1 / coef)
    };
}

function getElementPoint(event: JQueryEventObject, $element: JQuery, container: JQuery): utils.Point {
    var $data = $element.data("ko-draggable"),
        point = getMousePosition(event, container),
        result = { x: point.x - $data.vector.x, y: point.y - $data.vector.y };

    if (result.x < 0) result.x = 0;
    if (result.y < 0) result.y = 0;

    if (result.x + $element.width() > container.width()) result.x = container.width() - $element.width();
    if (result.y + $element.height() > container.height()) result.y = container.height() - $element.height();

    return result;
}

//#endregion

//#region Model

export interface DraggableOptions {
    isEnabled?: any;
    container: any;
    left: KnockoutObservable<number>;
    top: KnockoutObservable<number>;

    dragStart?: (vm: any) => any;
    dragEnd?: (vm: any) => any;
}

export class Draggable {
    private $element: JQuery;
    private container: JQuery;

    public isEnabled: KnockoutObservable<boolean>;
    public left: KnockoutObservable<number>;
    public top: KnockoutObservable<number>;
    
    public dragStart: (vm: any) => any;
    public dragEnd: (vm: any) => any;

    constructor(options: DraggableOptions, element: HTMLElement, public viewModel: any) {
        this.$element = $(element);
        this.container = this.$element.parents(ko.utils.unwrapObservable(options.container));
        this.isEnabled = utils.createObservable(options.isEnabled, false);

        this.left = options.left;
        this.top = options.top;
        this.dragStart = options.dragStart;
        this.dragEnd = options.dragEnd;

        this.isEnabled.subscribe(this.isEnabledChanged, this);
        this.isEnabled() && this.enable();

        _.bindAll(this, "onMouseDown", "onMouseMove", "onMouseUp");
    }

    public enable(): void {
        if (!this.isEnabled()) {
            this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
            this.$element.on("mousedown touchstart pointerdown", this.onMouseDown);

            if (pointerEnabled)
                this.$element.css({ "touch-action": "none", "-ms-touch-action": "none" });

            this.isEnabled(true);
        }
    }
    public disable(): void {
        if (this.isEnabled()) {
            this.$element.data("ko-draggable", { isMouseDown: false, lastPoint: { x: 0, y: 0 } });
            this.$element.off("mousedown touchstart pointerdown", this.onMouseDown);

            if (pointerEnabled)
                this.$element.css({ "touch-action": "", "-ms-touch-action": "" });

            this.isEnabled(false);
        }
    }

    private isEnabledChanged(enabled: boolean): void {
        enabled ? this.enable() : this.disable();
    }

    private onMouseDown(e: JQueryEventObject): boolean {
        var $data = this.$element.data("ko-draggable"),
            pos = { x: this.left(), y: this.top() },
            point = getMousePosition(e, this.container);

        $data.vector = { x: point.x - pos.x, y: point.y - pos.y };
        $data.isMouseDown = true;

        $doc.on("mouseup touchend pointerup", this.onMouseUp);
        this.container.on("mousemove touchmove pointermove", this.onMouseMove);

        if (this.dragStart && _.isFunction(this.dragStart)) {
            this.dragStart.call(this.viewModel);
        }

        doc.onselectstart = () => false; // prevent text selection in IE
        this.$element.get(0).ondragstart = () => false; // prevent IE from trying to drag an image

        return false;
    }
    private onMouseUp(e: JQueryEventObject): void {
        var $data = this.$element.data("ko-draggable");
        $data.isMouseDown = false;

        if (this.dragEnd && _.isFunction(this.dragEnd)) {
            this.dragEnd.call(this.viewModel);
        }

        $doc.off("mouseup touchend pointerup", this.onMouseUp);
        this.container.off("mousemove touchmove pointermove", this.onMouseMove);

        doc.onselectstart = null;
        this.$element.get(0).ondragstart = null;
    }
    private onMouseMove(e: JQueryEventObject): boolean {
        var $data = this.$element.data("ko-draggable");
        if ($data.isMouseDown) {
            var point = getElementPoint(e, this.$element, this.container);

            this.left(round(point.x));
            this.top(round(point.y));

            $data.lastPoint = point;
        }

        e.preventDefault();
        return false;
    }
}

//#endregion

//#region Handler

ko.bindingHandlers.draggable = {
    init: function (element: any, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void {
        var data = ko.utils.unwrapObservable(valueAccessor());

        if (!(data instanceof Draggable))
            element._draggable = new Draggable(data, element, viewModel);
    },
    update: function (element: any, valueAccessor: () => any): void {
        var data = ko.utils.unwrapObservable(valueAccessor()),
            draggable = element._draggable || data;

        if (!_.isUndefined(data.isEnabled) && !ko.isSubscribable(data.isEnabled)) {
            var isEnabled = $(element).data("dragIsEnabled");
            if (data.isEnabled !== isEnabled) {
                data.isEnabled ? draggable.enable() : draggable.disable();
                $(element).data("dragIsEnabled", data.isEnabled);
            }
        }
    }
};

//#endregion
