/// <reference path="_definitions.d.ts" />

import utils = require("./utils");

//#region Text Bindings

ko.bindingHandlers.limitedText = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            attr = ko.unwrap(options.attr || "text");

        if (attr === "html")
            ko.bindingHandlers.html.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            text = ko.unwrap(options.text),
            length = ko.unwrap(options.length),
            suffix = ko.unwrap(options.suffix || "..."),
            escapeCR = ko.unwrap(options.escapeCR || false),
            attr = ko.unwrap(options.attr || "text");

        var result = text;
        if (text) {
            if (text.length > length)
                result = result.substr(0, length) + suffix;
            if (escapeCR) {
                result = result.replace(new RegExp("\n", "g"), " ").replace(new RegExp("\r", "g"), " ");
            }
        }

        if (attr === "text")
            ko.bindingHandlers.text.update(element, utils.createAccessor(result), allBindingsAccessor, viewModel, bindingContext);
        else if (attr === "html")
            ko.bindingHandlers.html.update(element, utils.createAccessor(result), allBindingsAccessor, viewModel, bindingContext);
        else {
            var obj = {};
            obj[attr] = result;
            ko.bindingHandlers.attr.update(element, utils.createAccessor(obj), allBindingsAccessor, viewModel, bindingContext);
        }
    }
};
ko.bindingHandlers.pad = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            text = String(ko.unwrap(options.text)),
            length = ko.unwrap(options.length),
            char = ko.unwrap(options.char || "0"),
            prefix = ko.unwrap(options.prefix || ""),
            right = ko.unwrap(options.right || false);

        while (text.length < length) {
            text = right ? text + char : char + text;
        }

        ko.bindingHandlers.text.update(element, utils.createAccessor(prefix + text), allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.bindingHandlers.formatText = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            format = ko.unwrap(options.format),
            values = ko.unwrap(options.values),
            args = [format];

        _.each(values, function (value) {
            args.push(ko.unwrap(value));
        });

        ko.bindingHandlers.text.update(element, utils.createAccessor(utils.format.apply(null, args)), allBindingsAccessor, viewModel, bindingContext);
    }
};

var sizes = {
    k: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024
};

function simplifySize(size: string, suffix: string = ""): string {
    if (!size) {
        return "";
    }

    var _size: number = parseInt(size, 10),
        result: number = _size,
        unit: string = "";

    for (var key in sizes) {
        if (size > sizes[key]) {
            result = _size / sizes[key];
            unit = key;
            break;
        }
    }

    result = Math.round(result * 100) / 100;
    return utils.format("{0} {1}{2}", result, unit, suffix);
}

ko.bindingHandlers.filesize = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor()),
            suffix = allBindingsAccessor().suffix || "B";

        ko.bindingHandlers.text.update(element, utils.createAccessor(simplifySize(value, suffix)), allBindingsAccessor, viewModel, bindingContext);
    }
};

//#endregion

//#region Helper Bindings

ko.bindingHandlers.src = {
    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (element.src !== value)
            element.setAttribute("src", value);
    }
};
ko.bindingHandlers.href = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor());
        ko.bindingHandlers.attr.update(element, utils.createAccessor({ href: value }), allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.bindingHandlers.mailto = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var email = ko.unwrap(valueAccessor());
        ko.bindingHandlers.href.update(element, utils.createAccessor("mailto:" + email), allBindingsAccessor, viewModel, bindingContext);
    }
};

ko.bindingHandlers.classes = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor()),
            css = {};

        if (value) {
            _.each(value.split(" "), function (_class) {
                css[_class] = true;
            });
        }

        ko.bindingHandlers.css.update(element, utils.createAccessor(css), allBindingsAccessor, viewModel, bindingContext);
    }
};

//#endregion

//#region UI Bindings

ko.bindingHandlers.on = {
    init: function (element, valueAccessor) {
        var handlers = ko.unwrap(valueAccessor()),
            $element = $(element);

        _.each(handlers, function (handler, key?) {
            $element.on(key, handler);
        });
    }
};
ko.bindingHandlers.hover = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor());

        if (typeof value === "string")
            value = { classes: value };

        $(element)
            .on("mouseover", function (e: JQueryEventObject) {
                if (value.enter)
                    value.enter.call(viewModel, viewModel, e.originalEvent);

                if (value.classes)
                    ko.bindingHandlers.css.update(element, utils.createAccessor(value.classes), allBindingsAccessor, viewModel, bindingContext);
            })
            .on("mouseout", function (e: JQueryEventObject) {
                if (value.leave)
                    value.leave.call(viewModel, viewModel, e.originalEvent);

                if (value.classes)
                    ko.bindingHandlers.css.update(element, utils.createAccessor(""), allBindingsAccessor, viewModel, bindingContext);
            });
    }
};
ko.bindingHandlers.toggle = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = valueAccessor(),
            options = ko.unwrap(value),
            event = ko.unwrap(options.event) || "click",
            eventValue = {};

        if (_.isBoolean(options))
            options = { value: value };

        var handler = function () {
            if (ko.isWriteableObservable(options.value))
                options.value(!options.value());
        };

        eventValue[event] = handler;
        ko.bindingHandlers.event.init(element, utils.createAccessor(eventValue), allBindingsAccessor, viewModel, bindingContext);
    }
};

function createToggleClassAccessor(element, off, on, down) {
    var data = $(element).data("ko-toggle-class"),
        result = {},
        appendClasses = function (obj, classes, value) {
            _.each(classes.split(/\s+/), function (_class) {
                if (!obj[_class])
                    obj[_class] = value;
            });
        };

    if (data.off === data.on)
        appendClasses(result, data.off, off || on);
    else {
        appendClasses(result, data.off, off);
        appendClasses(result, data.on, on);
    }

    if (data.down !== data.off && data.down !== data.up)
        appendClasses(result, data.down, down);

    return () => result;
}

ko.bindingHandlers.toggleClass = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor()),
            off = ko.unwrap(value.off),
            on = ko.unwrap(value.on),
            down = ko.unwrap(value.down),
            useParent = ko.unwrap(value.useParent),
            _element = element;

        if (useParent)
            _element = $(element).parent().get(0);

        $(_element).data("ko-toggle-class", {
            off: off,
            on: on,
            down: down,
        });

        $(_element).on({
            mouseenter: function () {
                ko.bindingHandlers.css.update(element,
                    createToggleClassAccessor(this, false, true, false),
                    allBindingsAccessor, viewModel, bindingContext);
            },
            mouseout: function () {
                ko.bindingHandlers.css.update(element,
                    createToggleClassAccessor(this, true, false, false),
                    allBindingsAccessor, viewModel, bindingContext);
            },
            mousedown: function () {
                ko.bindingHandlers.css.update(element,
                    createToggleClassAccessor(this, false, false, true),
                    allBindingsAccessor, viewModel, bindingContext);
            },
            mouseup: function () {
                ko.bindingHandlers.css.update(element,
                    createToggleClassAccessor(this, false, true, false),
                    allBindingsAccessor, viewModel, bindingContext);
            }
        });
    },
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var value = ko.unwrap(valueAccessor()),
            off = ko.unwrap(value.off),
            on = ko.unwrap(value.on),
            down = ko.unwrap(value.down),
            useParent = ko.unwrap(value.useParent),
            _element = element;

        if (useParent)
            _element = $(element).parent().get(0);

        $(_element).data("ko-toggle-class", {
            off: off,
            on: on,
            down: down
        });

        ko.bindingHandlers.css.update(element, createToggleClassAccessor(_element, true, false, false), allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.bindingHandlers.dblclick = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var fn = valueAccessor();
        $(element).dblclick(function () {
            var data = ko.dataFor(this);
            fn.call(viewModel, data);
        });
    }
};

ko.bindingHandlers.editable = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            value = ko.unwrap(options.value),
            toValid = ko.unwrap(options.toValid || true),
            isEdit = ko.unwrap(options.isEdit || false),
            type = ko.unwrap(options.type || "text"),
            input = null;

        if (type === "textarea")
            input = $("<textarea>").attr({ "class": "textarea-editable" });
        else if (type === "select")
            input = $("<select>").attr({ "class": "select-editable" });
        else
            input = $("<input>").attr({ "class": "input-editable", type: type });

        if (element.hasAttribute("id"))
            input.attr("name", element.getAttribute("id"));

        $(element).after(input);
        input.after($("<del>"));

        if (type === "checkbox") {
            ko.bindingHandlers.checked.init(input.get(0), utils.createAccessor(options.value), allBindingsAccessor, viewModel, bindingContext);
            //input.after($("<del>"));
        }
        else
            ko.bindingHandlers.value.init(input.get(0), utils.createAccessor(options.value), allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var allBindings = allBindingsAccessor(),
            options = ko.unwrap(valueAccessor()),
            value = ko.unwrap(options.value),
            isEdit = ko.unwrap(options.isEdit || false),
            type = ko.unwrap(options.type || "text"),
            input = $(element).next(),
            del = input.nextAll("del");

        ko.bindingHandlers.visible.update(element, utils.createAccessor(!isEdit), allBindingsAccessor, viewModel, bindingContext);
        ko.bindingHandlers.visible.update(input.get(0), utils.createAccessor(isEdit), allBindingsAccessor, viewModel, bindingContext);
        ko.bindingHandlers.visible.update(del.get(0), utils.createAccessor(isEdit), allBindingsAccessor, viewModel, bindingContext);

        if (type === "checkbox") {
            ko.bindingHandlers.visible.update(input.next("del").get(0), utils.createAccessor(isEdit), allBindingsAccessor, viewModel, bindingContext);
            ko.bindingHandlers.checked.update(input.get(0), utils.createAccessor(options.value), allBindingsAccessor, viewModel, bindingContext);
        }
        else
            ko.bindingHandlers.value.update(input.get(0), utils.createAccessor(options.value), allBindingsAccessor, viewModel, bindingContext);

        if (type === "select" && options.options) {
            ko.bindingHandlers.options.update(input.get(0), utils.createAccessor(options.options), allBindingsAccessor, viewModel, bindingContext);

            if (allBindings.optionsText) {
                var optionsText = ko.unwrap(allBindings.optionsText);
                if (typeof (optionsText) === "string") {
                    var _selected = _.find(ko.unwrap(options.options), function (item) {
                        if (allBindings.optionsValue) {
                            var optionsValue = ko.unwrap(allBindings.optionsValue);
                            if (typeof (optionsValue) === "string") {
                                return ko.unwrap(item[optionsValue]) === value;
                            }
                            else if (typeof (optionsValue) === "function") {
                                return ko.unwrap(optionsValue.call(null, item)) === value;
                            }
                        }

                        return item === value;
                    });

                    if (_selected)
                        value = _selected[optionsText];
                }
                else if (typeof (optionsText) === "function") {
                    var _val = optionsText.call(null, value);
                    if (_val)
                        value = _val;
                }
            }
        }

        ko.bindingHandlers.text.update(element, utils.createAccessor(value), allBindingsAccessor, viewModel, bindingContext);
    }
};
ko.bindingHandlers.clipboard = {
    init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var _value = ko.unwrap(valueAccessor());

        var input = $("<input>").attr({ "class": "input-clipboard", "readonly": "readonly" }).val(_value).hide();

        $(element).after(input).text(_value);

        $(element).on("click", function () {
            $(element).hide();
            input.show().focus().select();
        });

        input
            .on("focusout", function () {
                $(element).show();
                input.hide();
            })
            .on("click", function () {
                $(this).select();
            });
    },
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var _value = ko.unwrap(valueAccessor());
        var input = $(element).next();

        $(element).text(_value).show();
        input.val(_value).hide();
    }
};

//#endregion

//#region Development Binding

ko.bindingHandlers.debug = {
    update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
        var options = ko.unwrap(valueAccessor()),
            message = "Debug Binding", value = options, sub = false;

        if (options.name && options.value) {
            value = ko.unwrap(options.value);
            message = ko.unwrap(options.message) || "Debug Binding";
            sub = ko.unwrap(options.sub) || false;
        }

        sub === true ?
        console.log(message, value) :
        console.log(message, " : ", value);
    }
};

ko.bindingHandlers.console = {
    update: function (element, valueAccessor) {
        console.log(ko.unwrap(valueAccessor()));
    }
};

//#endregion

//#region Extenders

ko.extenders.delay = function (target: any, delay: number): any {
    var value = target();

    target.timer = null;
    target.immediate = ko.observable(value);

    target.subscribe(target.immediate);
    target.immediate.subscribe(function (newValue) {
        if (newValue !== target()) {
            if (target.timer) {
                clearTimeout(target.timer);
            }

            target.timer = setTimeout(() => target(newValue), delay);
        }
    });

    return target;
};

ko.extenders.cnotify = function (target: any, notifyWhen: any): any {
    var latestValue: any = null,
        superNotify: Function = _.bind(ko.subscribable.fn.notifySubscribers, target),
        notify = function (value) {
            superNotify(latestValue, "beforeChange");
            superNotify(value);
        };

    target.notifySubscribers = function (value, event) {
        if (_.isFunction(notifyWhen)) { // custom
            if (event === "beforeChange") {
                latestValue = target.peek();
            }
            else if (!notifyWhen(latestValue, value)) {
                notify(value);
            }
            return;
        }

        switch (notifyWhen) {
            case "primitive":
                if (event === "beforeChange") {
                    latestValue = target.peek();
                }
                else if (!ko.observable.fn.equalityComparer(latestValue, value)) {
                    notify(value);
                }
                break;
            case "reference":
                if (event === "beforeChange") {
                    latestValue = target.peek();
                }
                else if (latestValue !== value) {
                    notify(value);
                }
                break;
            default:
                //case "auto":
                //case "always":
                superNotify.apply(null, arguments);
                break;
        }
    };

    return target;
};

ko.extenders.notify = function (target: any, notifyWhen: any): any {
    if (_.isFunction(notifyWhen)) { // custom
        target.equalityComparer = notifyWhen;
        return target;
    }
    switch (notifyWhen) {
        case "always":
            target.equalityComparer = () => false;
            break;
        case "manual":
            target.equalityComparer = () => true;
            break;
        case "reference":
            target.equalityComparer = (a, b) => a === b;
            break;
        default:
            //case "primitive":
            target.equalityComparer = ko.observable.fn.equalityComparer;
            break;
    }

    return target;
};

ko.extenders.cthrottle = function (target: any, timeout: number): any {
    target.throttleEvaluation = timeout;
    return target;
};

//#endregion
