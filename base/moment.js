/// <reference path="../_references.d.ts" />
/// <reference path="base.d.ts" />
var spa;
(function (spa) {
    var date;
    (function (date) {
        function getMoment(date, unix, utc, format) {
            if (unix)
                return moment.unix(date); else if (utc)
                return moment.utc(date, format); else
                return moment(date, format);
        }
        date.getMoment = getMoment;

        function dateToString(moment, unix, utc, format) {
            if (unix)
                return moment.valueOf(); else if (utc)
                return moment.utc().format(format); else
                return moment.format(format);
        }
        date.dateToString = dateToString;

        function getMomentDuration(timeSpan) {
            var regex = /((\d*)\.)?(\d{2}):(\d{2}):(\d{2})(\.(\d{0,3}))?/;
            if (regex.test(timeSpan)) {
                var matches = timeSpan.match(regex);
                var options = {
                    milliseconds: parseInt(matches[7] || 0, 10),
                    seconds: parseInt(matches[5], 10),
                    minutes: parseInt(matches[4], 10),
                    hours: parseInt(matches[3], 10),
                    days: parseInt(matches[2] || 0, 10)
                };

                return moment.duration(options);
            }
        }
        date.getMomentDuration = getMomentDuration;

        ko.extenders.moment = function (target, options) {
            var opts = { format: null, unix: false, utc: false };
            opts = _.extend(opts, options || {});

            var setDate = function (newValue) {
                if (typeof newValue === "undefined") { newValue = null; }
                if (opts.unix)
                    target.date = moment.unix(newValue); else if (opts.utc)
                    target.date = moment.utc(newValue, opts.format); else
                    target.date = moment(newValue, opts.format);
            }, getDate = function (moment) {
                if (opts.unix)
                    return moment.valueOf(); else if (opts.utc)
                    return moment.utc().format(opts.format); else
                    return moment.format(opts.format);
            }, registerGetSet = function (fn) {
                target[fn] = function () {
                    var val = target.date[fn].apply(target.date, arguments);

                    if (arguments.length > 0)
                        target(getDate(target.date));

                    return val;
                };
            }, registerManip = function (fn) {
                target[fn] = function () {
                    var val = target.date[fn].apply(target.date, arguments);

                    target(getDate(target.date));

                    return val;
                };
            }, registerDisplay = function (fn) {
                target[fn] = function () {
                    return target.date[fn].apply(target.date, arguments);
                };
            }, getsetsFn = ["milliseconds", "seconds", "minutes", "hours", "date", "day", "month", "year"], manipFn = ["add", "substract", "startOf", "endOf", "sod", "eod", "local", "utc"], displayFn = ["format", "from", "fromNow", "diff", "toDate", "valueOf", "unix", "isLeapYear", "zone", "daysInMonth", "isDST"];

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
        ko.extenders.momentDuration = function (target, options) {
            var setDuration = function (newValue) {
                if (typeof newValue === "undefined") { newValue = null; }
                if (!newValue)
                    newValue = target();

                target.duration = getMomentDuration(newValue);
            }, registerFn = function (fn) {
                target[fn] = function () {
                    return (target.duration) ? target.duration[fn].apply(target.duration, arguments) : null;
                };
            }, fns = ["humanize", "milliseconds", "asMilliseconds", "seconds", "asSeconds", "minutes", "asMinutes", "hours", "asHours", "days", "asDays", "months", "asMonths", "years", "asYears"];

            setDuration();
            target.subscribe(setDuration);

            _.each(fns, registerFn);

            return target;
        };

        ko.bindingHandlers.date = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(allBindingsAccessor()), format = ko.utils.unwrapObservable(options.format), utc = ko.utils.unwrapObservable(options.utc || false), unix = ko.utils.unwrapObservable(options.unix || false), value = valueAccessor(), attr = ko.utils.unwrapObservable(options.dattr || "text");

                if (ko.isWriteableObservable(value) && attr === "value") {
                    $(element).change(function (event) {
                        var moment = getMoment($(this).val(), unix, utc, format);
                        value(dateToString(moment, unix, utc, ""));
                    });
                }
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var options = ko.utils.unwrapObservable(allBindingsAccessor()), format = ko.utils.unwrapObservable(options.format), utc = ko.utils.unwrapObservable(options.utc || false), unix = ko.utils.unwrapObservable(options.unix || false), attr = ko.utils.unwrapObservable(options.dattr || "text"), value = valueAccessor();

                if (value && ko.utils.unwrapObservable(value)) {
                    var _moment = (value.date && moment.isMoment(value.date)) ? value.date : getMoment(ko.utils.unwrapObservable(value), unix, utc, format), text = dateToString(_moment, unix, utc, format);

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
    })(date || (date = {}));
})(spa || (spa = {}));
