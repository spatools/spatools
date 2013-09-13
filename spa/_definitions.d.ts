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

declare module _ {
    export function sum<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    export function average<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    export function count<T>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    export function filterMap<T, TResult>(collection: { [key: string]: T }, iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    export function filterMap<T, TResult>(collection: T[], iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    export function index<T>(collection: T[], iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    export function partialEnd<T>(func: () => T, ...args: any[]): () => T;
}

interface KnockoutUnderscoreArrayFunctions {
    each<T>(iterator: (element: T, index?: number, list?: T[]) => void, context?: any): KnockoutComputed<void>;
    map<T, TResult>(iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): KnockoutComputed<TResult[]>;
    filterMap<T, TResult>(iterator?: (element: T, index?: number, list?: T[]) => TResult, context?: any): KnockoutComputed<TResult[]>;
    reduce<T, TResult>(iterator: (memo: TResult, element: T, index?: number, list?: T[]) => TResult, memo: TResult, context?: any): KnockoutComputed<TResult>;
    find<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T>;
    filter<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T[]>;
    reject<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<T[]>;
    sum<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<number>;
    average<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<number>;
    all<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<boolean>;
    any<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<boolean>;
    contains<T>(value: T): boolean;
    max<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<T>;
    min<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): KnockoutComputed<T>;
    sortBy<T, TSort>(iterator: (element: T, index?: number, list?: T[]) => TSort, context?: any): KnockoutComputed<T[]>;
    groupBy<T>(iterator: (element: T, index?: number, list?: T[]) => string, context?: any): KnockoutComputed<{ [key: string]: any[]; }>;
    toArray(): any[];
    count<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<number>;
    index<T>(iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): KnockoutComputed<number>;
    size(): KnockoutComputed<number>;
    first<T>(): KnockoutComputed<T>;
    last<T>(): KnockoutComputed<T>;
    initial<T>(n?: number): KnockoutComputed<T[]>;
    rest<T>(index?: number): KnockoutComputed<T[]>;
    compact<T>(): KnockoutComputed<T[]>;
    flatten(shallow?: boolean): KnockoutComputed<any>;
    without<T>(...values: T[]): KnockoutComputed<T[]>;
    union<T>(...arrays: T[][]): KnockoutComputed<T[]>;
    intersection<T>(...arrays: T[][]): KnockoutComputed<T[]>;
    difference<T>(...others: T[][]): KnockoutComputed<T[]>;
    uniq<T, TSort>(isSorted?: boolean, iterator?: (element: T, index?: number, list?: T[]) => TSort, context?: any): KnockoutComputed<T[]>;
    zip(...arrays: any[][]): KnockoutComputed<any[][]>;
    indexOf<T>(value: T, isSorted?: boolean): KnockoutComputed<number>;
    lastIndexOf<T>(value: T, from?: number): KnockoutComputed<number>;

    _each<T>(iterator: (element: T, index?: number, list?: T[]) => void, context?: any): void;
    _map<T, TResult>(iterator: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    _filterMap<T, TResult>(iterator?: (element: T, index?: number, list?: T[]) => TResult, context?: any): TResult[];
    _reduce<T, TResult>(iterator: (memo: TResult, element: T, index?: number, list?: T[]) => TResult, memo: TResult, context?: any): TResult;
    _find<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T;
    _filter<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T[];
    _reject<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): T[];
    _sum<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    _average<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): number;
    _all<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): boolean;
    _any<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): boolean;
    _contains<T>(value: T): boolean;
    _max<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): T;
    _min<T>(iterator: (element: T, index?: number, list?: T[]) => number, context?: any): T;
    _sortBy<T, TSort>(iterator: (element: T, index?: number, list?: T[]) => TSort, context?: any): T[];
    _groupBy<T>(iterator: (element: T, index?: number, list?: T[]) => string, context?: any): { [key: string]: any[]; };
    _toArray(): any[];
    _count<T>(iterator: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    _index<T>(iterator?: (element: T, index?: number, list?: T[]) => boolean, context?: any): number;
    _size(): number;
    _first<T>(): T;
    _last<T>(): T;
    _initial<T>(n?: number): T[];
    _rest<T>(index?: number): T[];
    _compact<T>(): T[];
    _flatten(shallow?: boolean): any;
    _without<T>(...values: T[]): T[];
    _union<T>(...arrays: T[][]): T[];
    _intersection<T>(...arrays: T[][]): T[];
    _difference<T>(...others: T[][]): T[];
    _uniq<T, TSort>(isSorted?: boolean, iterator?: (element: T, index?: number, list?: T[]) => TSort, context?: any): T[];
    _zip(...arrays: any[][]): any[][];
    _indexOf<T>(value: T, isSorted?: boolean): number;
    _lastIndexOf<T>(value: T, from?: number): number;
}

interface KnockoutObservableArrayFunctions<T> extends KnockoutUnderscoreArrayFunctions {
    indexOf<T>(value: T, isSorted?: boolean): KnockoutComputed<number>;
    lastIndexOf<T>(value: T, from?: number): KnockoutComputed<number>;
}

interface KnockoutUnderscoreObjectsFunctions {
    keys(): KnockoutComputed<string[]>;
    values(): KnockoutComputed<any[]>;
    clone<T>(object: T): KnockoutComputed<T>;
    isEmpty(object: any): KnockoutComputed<boolean>;

    _keys(): string[];
    _values(): any[];
    _clone<T>(object: T): T;
    _isEmpty(object: any): boolean;
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
