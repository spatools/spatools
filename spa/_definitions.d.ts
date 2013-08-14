/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/requirejs/require.d.ts" />
/// <reference path="../build/spatools.d.ts" />

interface KnockoutBindingHandlers {
    fullscreen: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => {}, viewModel: any, bindingContext: KnockoutBindingContext): void;
    };

    contextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };

    subcontextmenu: {
        init(element: HTMLElement, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any): void;
    };
}

interface KnockoutTemplateEngine {
    addTemplate(id: string, template: string): void;
}

interface KnockoutTemplateSources {
    require: any;
}

interface KnockoutStatic {
    requireTemplateEngine: any;
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