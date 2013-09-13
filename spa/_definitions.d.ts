/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/requirejs/require.d.ts" />
// <reference path="../build/spatools.d.ts" />

interface KnockoutBindingHandlers {
    date: KnockoutBindingHandler;
    command: KnockoutBindingHandler;
    loader: KnockoutBindingHandler;
    limitedText: KnockoutBindingHandler;
    pad: KnockoutBindingHandler;
    formatText: KnockoutBindingHandler;
    filesize: KnockoutBindingHandler;
    src: KnockoutBindingHandler;
    href: KnockoutBindingHandler;
    mailto: KnockoutBindingHandler;
    classes: KnockoutBindingHandler;
    on: KnockoutBindingHandler;
    hover: KnockoutBindingHandler;
    toggle: KnockoutBindingHandler;
    toggleClass: KnockoutBindingHandler;
    dblclick: KnockoutBindingHandler;
    editable: KnockoutBindingHandler;
    clipboard: KnockoutBindingHandler;
    debug: KnockoutBindingHandler;
    console: KnockoutBindingHandler;

    fullscreen: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => {}, viewModel: any, bindingContext: KnockoutBindingContext): void;
    };

    contextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    subcontextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };

    draggable: {
        init(element: any, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: any, valueAccessor: () => any): void;
    };

    popOut: { update(element: HTMLElement, valueAccessor: () => any): void; };
    ribbon: KnockoutBindingHandler;
    ribbonPage: KnockoutBindingHandler;
    ribbonGroup: KnockoutBindingHandler;
    ribbonList: KnockoutBindingHandler;
    ribbonForm: KnockoutBindingHandler;
    ribbonItem: KnockoutBindingHandler;
    ribbonButton: KnockoutBindingHandler;
    ribbonCheckbox: KnockoutBindingHandler;
    ribbonInput: KnockoutBindingHandler;
    ribbonSlider: KnockoutBindingHandler;
    ribbonFlyout: KnockoutBindingHandler;

    treenodedrag: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    treenodedrop: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    treenodeselectvisible: {
        update(element: HTMLElement, valueAccessor: () => any): void;
    };
    treenoderename: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
        update(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
    tree: {
        init(element: HTMLElement, valueAccessor: () => any): any;
        update(element: HTMLElement, valueAccessor: () => any): void;
    };

    editor: {
        init(element: HTMLElement, valueAccessor: () => any): void;
        update(element: HTMLElement, valueAccessor: () => any): void;
    };
}

interface KnockoutExtenders {
    moment: (target: any, options: Object) => any;
    momentDuration: (target: any, options: any) => any;
    delay: (target: any, delay: number) => any;
    cnotify: (target: any, notifyWhen: any) => any;
    cthrottle: (target: any, timeout: number) => any;
    //notify: (target: any, notifyWhen: string, customEqualityComparer: (v1: any, v2: any) => number) => any;
}

//interface KnockoutTemplateEngine {
//    addTemplate(id: string, template: string): void;
//}

interface KnockoutTemplateSources {
    require: KnockoutPrototypeStatic<KnockoutTemplateSource>;
}

interface KnockoutStatic {
    requireTemplateEngine: KnockoutPrototypeStatic<KnockoutTemplateEngine>;
}

interface OperationOptions {
    useArguments?: boolean;
    cache?: boolean;
    cacheDuration?: number;
    message?: string;

    execute: () => any;
    complete: () => any;
    error: () => any;
    progress: () => any;
}

interface OperationFunction extends Function {
    isExecuting: KnockoutObservable<boolean>;
    progress: KnockoutObservable<number>;
    progressDetails: KnockoutObservable<any>;
    error: KnockoutObservable<string>;
    errorDetails: KnockoutObservable<any>;
    hasError: KnockoutObservable<boolean>;
}