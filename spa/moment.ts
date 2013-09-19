/// <reference path="_definitions.d.ts" />

export interface MomentExtenderOptions {
    format: string;
    unix: boolean;
    utc: boolean;
}

export function getMoment(date: any, unix: boolean, utc: boolean, format: string): Moment {
    if (unix) {
        return moment.unix(date);
    } else if (utc) {
        if (!date) {
            return null;
        }

        return moment.utc(date, format);
    } else {
        return moment(date, format);
    }
}

export function dateToString(moment: Moment, unix: boolean, utc: boolean, format: string): string {
    if (!moment) {
        return null;
    }

    if (unix) {
        return moment.valueOf().toString();
    } else if (utc) {
        return moment.utc().format(format);
    } else {
        return moment.format(format);
    }
}

export function getMomentDuration(timeSpan: string): Duration {
    var litRegex = /((\d*)\.)?(\d{2}):(\d{2}):(\d{2})(\.(\d{0,3}))?/,
        isoRegex = /^P(([\d\.]+)Y)?(([\d\.]+)M)?(([\d\.]+)D)?T(([\d\.]+)H)?(([\d\.]+)M)?(([\d\.]+)S)?$/,
        matches, options;

    if (isoRegex.test(timeSpan)) {
        matches = timeSpan.match(isoRegex);
        options = {
            years: matches[1] ? parseFloat(matches[2]) : 0,
            months: matches[3] ? parseFloat(matches[4]) : 0,
            days: matches[5] ? parseFloat(matches[6]) : 0,
            hours: matches[7] ? parseFloat(matches[8]) : 0,
            minutes: matches[9] ? parseFloat(matches[10]) : 0,
            seconds: matches[11] ? parseFloat(matches[12]) : 0
        };
    }
    else if (litRegex.test(timeSpan)) {
        matches = timeSpan.match(litRegex);
        options = {
            milliseconds: parseInt(matches[7] || 0, 10),
            seconds: parseInt(matches[5], 10),
            minutes: parseInt(matches[4], 10),
            hours: parseInt(matches[3], 10),
            days: parseInt(matches[2] || 0, 10)
        };
    }

    if (options)
        return moment.duration(options);
}

export function init(): void {
    ko.extenders.moment = function (target: any, options: Object): any {
        var opts: MomentExtenderOptions = { format: null, unix: false, utc: false };
        opts = _.extend(opts, options || {});

        var
            setDate = function (newValue: any = null): void {
                target.date = getMoment(newValue, opts.unix, opts.utc, opts.format);
            },
            getDate = function (moment: Moment): string {
                return dateToString(moment, opts.unix, opts.utc, opts.format);
            },

            registerGetSet = function (fn: string): void {
                target[fn] = function () {
                    var val = target.date[fn].apply(target.date, arguments);

                    if (arguments.length > 0)
                        target(getDate(target.date));

                    return val;
                };
            },
            registerManip = function (fn: string): void {
                target[fn] = function () {
                    var val = target.date[fn].apply(target.date, arguments);

                    target(getDate(target.date));

                    return val;
                };
            },
            registerDisplay = function (fn: string): void {
                target[fn] = function () {
                    return target.date[fn].apply(target.date, arguments);
                };
            },

            getsetsFn = ["milliseconds", "seconds", "minutes", "hours", "date", "day", "month", "year"],
            manipFn = ["add", "substract", "startOf", "endOf", "sod", "eod", "local", "utc"],
            displayFn = ["format", "from", "fromNow", "diff", "toDate", "valueOf", "unix", "isLeapYear", "zone", "daysInMonth", "isDST"];

        setDate(target());
        target.subscribe(setDate);

        _.each(getsetsFn, registerGetSet);
        _.each(manipFn, registerManip);
        _.each(displayFn, registerDisplay);

        target.now = function () {
            setDate();
            target(getDate(target.date));
        };

        return target;
    };
    ko.extenders.momentDuration = function (target: any, options: any): any {
        var
            setDuration = function (newValue: string = null): void {
                target.duration = getMomentDuration(newValue);
            },

            registerFn = function (fn: string): void {
                target[fn] = function () {
                    return (target.duration) ? target.duration[fn].apply(target.duration, arguments) : null;
                };
            },

            fns = ["humanize", "milliseconds", "asMilliseconds", "seconds", "asSeconds", "minutes", "asMinutes", "hours", "asHours", "days", "asDays", "months", "asMonths", "years", "asYears"];

        setDuration(target());
        target.subscribe(setDuration);

        _.each(fns, registerFn);

        return target;
    };

    ko.bindingHandlers.date = {
        init: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
            var options = ko.utils.unwrapObservable(allBindingsAccessor()),
                format = ko.utils.unwrapObservable(options.format),
                utc = ko.utils.unwrapObservable(options.utc || false),
                unix = ko.utils.unwrapObservable(options.unix || false),
                value = valueAccessor(),
                attr = ko.utils.unwrapObservable(options.dattr || "text");

            if (ko.isWriteableObservable(value) && attr === "value") {
                $(element).change(function (event) {
                    var moment = getMoment($(this).val(), unix, utc, format);
                    value(dateToString(moment, unix, utc, ""));
                });
            }
        },
        update: function (element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: KnockoutBindingContext) {
            var options = ko.utils.unwrapObservable(allBindingsAccessor()),
                format = ko.utils.unwrapObservable(options.format),
                utc = ko.utils.unwrapObservable(options.utc || false),
                unix = ko.utils.unwrapObservable(options.unix || false),
                attr = ko.utils.unwrapObservable(options.dattr || "text"),
                value = valueAccessor();

            if (value && ko.utils.unwrapObservable(value)) {
                var _moment = (value.date && moment.isMoment(value.date)) ? value.date : getMoment(ko.utils.unwrapObservable(value), unix, utc, format),
                    text = dateToString(_moment, unix, utc, format);

                switch (attr) {
                    case "value":
                        $(element).val(text);
                        break;
                    case "text":
                        $(element).text(text);
                        break;
                    default:
                        $(element).attr(attr, text);
                        break;
                }
            }
        }
    };
}
