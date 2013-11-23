/// <reference path="_definitions.d.ts" />

export interface KeyboardShortcutOptions {
    action: () => any;
    shortcut: string;
    onRelease?: boolean;
}

export class KeyboardManager {
    public isCtrlDown = ko.observable(false);
    public isShiftDown = ko.observable(false);
    public isAltDown = ko.observable(false);
    public shortcuts = ko.observableArray<KeyboardShortcut>();

    private execShortcut(event: JQueryEventObject, isReleasing: boolean = false) {
        var toExecute = this.shortcuts.filter(s => {
            var key = s.key();
            
            return s.onRelease === isReleasing
                && (_.isNumber(key) ? key === event.keyCode : key === String.fromCharCode(event.keyCode).toLowerCase())
                && s.ctrl() === this.isCtrlDown()
                && s.shift() === this.isShiftDown()
                && s.alt() === this.isAltDown();
        });
        
        if (toExecute.length > 0) {
            _.each(toExecute, function (shortcut) {
                shortcut.action.call(shortcut);
            });
            
            return false;
        }
    }

    /** Bind keyboard manager to current window */
    public bind(): void {
        $(window).bind("keydown.kbdManager", e => {
            if ($(e.target).is("input")) {
                return;
            }

            switch (e.keyCode) {
                case 16: //Shift
                    this.isShiftDown(true);
                    break;
                case 17: //Ctrl
                    this.isCtrlDown(true);
                    break;
                case 18: //Alt
                    this.isAltDown(true);
                    break;
                default:
                    return this.execShortcut(e);
            }
        });
        $(window).bind("keyup.kbdManager", e => {
            if ($(e.target).is("input")) {
                return;
            }

            switch (e.keyCode) {
                case 16: //Shift
                    this.isShiftDown(false);
                    break;
                case 17: //Ctrl
                    this.isCtrlDown(false);
                    break;
                case 18: //Alt
                    this.isAltDown(false);
                    break;
                default:
                    return this.execShortcut(e, true);
            }
        });
    }
    /** Unbind keyboard manager from current window */
    public unbind(): void {
        $(window).unbind("keydown.kbdManager");
        $(window).unbind("keyup.kbdManager");
    }

    /** Add a new shortcut to keyboardManager */
    public addShortcut(options: KeyboardShortcutOptions): KeyboardManager {
        if (options.action && options.shortcut)
            this.shortcuts.push(new KeyboardShortcut(options, this));

        return this;
    }
    /** Add an array of shortcut options */
    public addShortcuts(options: KeyboardShortcutOptions[]): KeyboardManager {
        _.each(options, this.addShortcut, this);
        return this;
    }

    /** Remove the specified shortcut by shortcut or options */
    public removeShortcut(options: any): KeyboardManager {
        var shortcut = _.isString(options) ? options : options.shortcut,
            index = -1;

        this.shortcuts.find(function (s, i) { index = i; return s.initialShortcut === shortcut; });

        if (index !== -1) {
            this.shortcuts.splice(index, 1);
        }

        return this;
    }
    /** Remove an array of shortcut options or shortcut string */
    public removeShortcuts(options: any[]): KeyboardManager {
        _.each(options, this.removeShortcut, this);
        return this;
    }
}

export class KeyboardShortcut {
    public onRelease: boolean = false;
    public initialShortcut: string = "";
    public key: KnockoutObservable<any> = ko.observable();
    public ctrl: KnockoutObservable<boolean> = ko.observable(false);
    public shift: KnockoutObservable<boolean> = ko.observable(false);
    public alt: KnockoutObservable<boolean> = ko.observable(false);
    public action: () => any;

    constructor(options: KeyboardShortcutOptions, manager: KeyboardManager) {
        if (options.onRelease)
            this.onRelease = options.onRelease;

        this.initialShortcut = options.shortcut;
        this.action = options.action;
        
        _.each(this.initialShortcut.split("+"), modifier => {
            switch (modifier.trim().toLowerCase()) {
                case "ctrl":
                    this.ctrl(true);
                    break;
                case "shift":
                    this.shift(true);
                    break;
                case "alt":
                    this.alt(true);
                    break;
                case "left":
                    this.key(37);
                    break;
                case "top":
                    this.key(38);
                    break;
                case "right":
                    this.key(39);
                    break;
                case "bottom":
                    this.key(40);
                    break;
                case "esc":
                case "escape":
                    this.key(27);
                    break;
                case "enter":
                    this.key(13);
                    break;
                case "suppr":
                case "del":
                    this.key(46);
                    break;
                case "space":
                    this.key(32);
                    break;
                default:
                    this.key(modifier);
                    break;
            }
        });
    }
}
