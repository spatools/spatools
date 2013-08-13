define(["require", "exports"], function(require, exports) {
    var KeyboardManager = (function () {
        function KeyboardManager() {
            this.isCtrlDown = ko.observable(false);
            this.isShiftDown = ko.observable(false);
            this.isAltDown = ko.observable(false);
            this.shortcuts = ko.observableArray();
        }
        KeyboardManager.prototype.execShortcut = function (event, isReleasing) {
            if (typeof isReleasing === "undefined") { isReleasing = false; }
            var _this = this;
            var toExecute = this.shortcuts._filter(function (s) {
                var key = s.key();

                return s.onRelease === isReleasing && (_.isNumber(key) ? key === event.keyCode : key === String.fromCharCode(event.keyCode).toLowerCase()) && s.ctrl() === _this.isCtrlDown() && s.shift() === _this.isShiftDown() && s.alt() === _this.isAltDown();
            });

            if (toExecute.length > 0) {
                _.each(toExecute, function (shortcut) {
                    shortcut.action.call(shortcut);
                });

                return false;
            }
        };

        /** Bind keyboard manager to current window */
        KeyboardManager.prototype.bind = function () {
            var _this = this;
            $(window).bind("keydown.kbdManager", function (e) {
                switch (e.keyCode) {
                    case 16:
                        _this.isShiftDown(true);
                        break;
                    case 17:
                        _this.isCtrlDown(true);
                        break;
                    case 18:
                        _this.isAltDown(true);
                        break;
                    default:
                        return _this.execShortcut(e);
                }
            });
            $(window).bind("keyup.kbdManager", function (e) {
                switch (e.keyCode) {
                    case 16:
                        _this.isShiftDown(false);
                        break;
                    case 17:
                        _this.isCtrlDown(false);
                        break;
                    case 18:
                        _this.isAltDown(false);
                        break;
                    default:
                        return _this.execShortcut(e, true);
                }
            });
        };

        /** Unbind keyboard manager from current window */
        KeyboardManager.prototype.unbind = function () {
            $(window).unbind("keydown.kbdManager");
            $(window).unbind("keyup.kbdManager");
        };

        /** Add a new shortcut to keyboardManager */
        KeyboardManager.prototype.addShortcut = function (options) {
            if (options.action && options.shortcut)
                this.shortcuts.push(new KeyboardShortcut(options, this));

            return this;
        };

        /** Add an array of shortcut options */
        KeyboardManager.prototype.addShortcuts = function (options) {
            _.each(options, this.addShortcut, this);
            return this;
        };

        /** Remove the specified shortcut by shortcut or options */
        KeyboardManager.prototype.removeShortcut = function (options) {
            var shortcut = _.isString(options) ? options : options.shortcut, index = -1;

            this.shortcuts._find(function (s, i) {
                index = i;
                return s.initialShortcut === shortcut;
            });

            if (index !== -1) {
                this.shortcuts.splice(index, 1);
            }

            return this;
        };

        /** Remove an array of shortcut options or shortcut string */
        KeyboardManager.prototype.removeShortcuts = function (options) {
            _.each(options, this.removeShortcut, this);
            return this;
        };
        return KeyboardManager;
    })();
    exports.KeyboardManager = KeyboardManager;

    var KeyboardShortcut = (function () {
        function KeyboardShortcut(options, manager) {
            var _this = this;
            this.onRelease = false;
            this.initialShortcut = "";
            this.key = ko.observable();
            this.ctrl = ko.observable(false);
            this.shift = ko.observable(false);
            this.alt = ko.observable(false);
            if (options.onRelease)
                this.onRelease = options.onRelease;

            this.initialShortcut = options.shortcut;
            this.action = options.action;

            _.each(this.initialShortcut.split('+'), function (modifier) {
                switch (modifier.trim().toLowerCase()) {
                    case "ctrl":
                        _this.ctrl(true);
                        break;
                    case "shift":
                        _this.shift(true);
                        break;
                    case "alt":
                        _this.alt(true);
                        break;
                    case "left":
                        _this.key(37);
                        break;
                    case "top":
                        _this.key(38);
                        break;
                    case "right":
                        _this.key(39);
                        break;
                    case "bottom":
                        _this.key(40);
                        break;
                    case "esc":
                    case "escape":
                        _this.key(27);
                        break;
                    case "enter":
                        _this.key(13);
                        break;
                    case "suppr":
                    case "del":
                        _this.key(46);
                        break;
                    case "space":
                        _this.key(32);
                        break;
                    default:
                        _this.key(modifier);
                        break;
                }
            });
        }
        return KeyboardShortcut;
    })();
    exports.KeyboardShortcut = KeyboardShortcut;
});
