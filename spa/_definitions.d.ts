/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/requirejs/require.d.ts" />

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

    slider: KnockoutBindingHandler;
    sliderEvents: KnockoutBindingHandler;

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

interface KnockoutTemplateEngine {
    addTemplate?(id: string, template: string): void;
}

interface KnockoutTemplateSources {
    require: any;
}

interface KnockoutStatic {
    requireTemplateEngine: any;
}

declare module _ {
    export function sum<T>(list: _.List<T>, iterator: _.ListIterator<T, number>, context?: any): number;
    export function sum<T>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, number>, context?: any): number;

    export function average<T>(list: _.List<T>, iterator: _.ListIterator<T, number>, context?: any): number;
    export function average<T>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, number>, context?: any): number;

    export function count<T>(list: _.List<T>, iterator?: _.ListIterator<T, boolean>, context?: any): number;
    export function count<T>(object: _.Dictionary<T>, iterator?: _.ObjectIterator<T, boolean>, context?: any): number;

    export function filterMap<T, TResult>(list: _.List<T>, iterator: _.ListIterator<T, TResult>, context?: any): TResult[];
    export function filterMap<T, TResult>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, TResult>, context?: any): TResult[];

    export function index<T>(list: _.List<T>, iterator: _.ListIterator<T, boolean>, context?: any): number;
    export function index<T>(object: _.Dictionary<T>, iterator: _.ObjectIterator<T, boolean>, context?: any): number;

    export function partialEnd<T>(func: () => T, ...args: any[]): () => T;
}

interface KnockoutUnderscoreArrayFunctions<T> {
    each(iterator: _.ListIterator<T, void>, context?: any): void;
    map<TResult>(iterator: _.ListIterator<T, TResult>, context?: any): TResult[];
    filterMap<TResult>(iterator?: _.ListIterator<T, TResult>, context?: any): TResult[];
    reduce<TResult>(iterator: _.MemoIterator<T, TResult>, memo: TResult, context?: any): TResult;
    find(iterator: _.ListIterator<T, boolean>, context?: any): T;
    filter(iterator: _.ListIterator<T, boolean>, context?: any): T[];
    reject(iterator: _.ListIterator<T, boolean>, context?: any): T[];
    sum(iterator: _.ListIterator<T, number>, context?: any): number;
    average(iterator: _.ListIterator<T, number>, context?: any): number;
    all(iterator: _.ListIterator<T, boolean>, context?: any): boolean;
    any(iterator: _.ListIterator<T, boolean>, context?: any): boolean;
    contains(value: T): boolean;
    max(iterator: _.ListIterator<T, number>, context?: any): T;
    min(iterator: _.ListIterator<T, number>, context?: any): T;
    sortBy<TSort>(iterator: _.ListIterator<T, TSort>, context?: any): T[];
    groupBy(iterator: _.ListIterator<T, any>, context?: any): { [key: string]: any[]; };
    toArray(): any[];
    count(iterator: _.ListIterator<T, boolean>, context?: any): number;
    index(iterator?: _.ListIterator<T, boolean>, context?: any): number;
    size(): number;
    first(): T;
    last(): T;
    initial(n?: number): T[];
    rest(index?: number): T[];
    compact(): T[];
    flatten(shallow?: boolean): any;
    without(...values: T[]): T[];
    union(...arrays: T[][]): T[];
    intersection(...arrays: T[][]): T[];
    difference(...others: T[][]): T[];
    uniq<TSort>(isSorted?: boolean, iterator?: _.ListIterator<T, TSort>, context?: any): T[];
    zip(...arrays: any[][]): any[][];
    indexOf(value: T, isSorted?: boolean): number;
    lastIndexOf(value: T, from?: number): number;

    _each(iterator: _.ListIterator<T, void>, context?: any): KnockoutComputed<void>;
    _map<TResult>(iterator: _.ListIterator<T, TResult>, context?: any): KnockoutComputed<TResult[]>;
    _filterMap<TResult>(iterator?: _.ListIterator<T, TResult>, context?: any): KnockoutComputed<TResult[]>;
    _reduce<TResult>(iterator: _.MemoIterator<T, TResult>, memo: TResult, context?: any): KnockoutComputed<TResult>;
    _find(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<T>;
    _filter(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<T[]>;
    _reject(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<T[]>;
    _sum(iterator: _.ListIterator<T, number>, context?: any): KnockoutComputed<number>;
    _average(iterator: _.ListIterator<T, number>, context?: any): KnockoutComputed<number>;
    _all(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<boolean>;
    _any(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<boolean>;
    _contains(value: T): boolean;
    _max(iterator: _.ListIterator<T, number>, context?: any): KnockoutComputed<T>;
    _min(iterator: _.ListIterator<T, number>, context?: any): KnockoutComputed<T>;
    _sortBy<T, TSort>(iterator: _.ListIterator<T, TSort>, context?: any): KnockoutComputed<T[]>;
    _groupBy(iterator: (element: T, index?: number, list?: T[]) => string, context?: any): KnockoutComputed<{ [key: string]: any[]; }>;
    _toArray(): any[];
    _count(iterator: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<number>;
    _index(iterator?: _.ListIterator<T, boolean>, context?: any): KnockoutComputed<number>;
    _size(): KnockoutComputed<number>;
    _first(): KnockoutComputed<T>;
    _last(): KnockoutComputed<T>;
    _initial(n?: number): KnockoutComputed<T[]>;
    _rest(index?: number): KnockoutComputed<T[]>;
    _compact(): KnockoutComputed<T[]>;
    _flatten(shallow?: boolean): KnockoutComputed<any>;
    _without(...values: T[]): KnockoutComputed<T[]>;
    _union(...arrays: T[][]): KnockoutComputed<T[]>;
    _intersection(...arrays: T[][]): KnockoutComputed<T[]>;
    _difference(...others: T[][]): KnockoutComputed<T[]>;
    _uniq<TSort>(isSorted?: boolean, iterator?: _.ListIterator<T, TSort>, context?: any): KnockoutComputed<T[]>;
    _zip(...arrays: any[][]): KnockoutComputed<any[][]>;
    _indexOf(value: T, isSorted?: boolean): KnockoutComputed<number>;
    _lastIndexOf(value: T, from?: number): KnockoutComputed<number>;
}

interface KnockoutUnderscoreObjectsFunctions<T> {
    keys(): string[];
    values(): any[];
    clone(object: T): T;
    isEmpty(object: any): boolean;

    _keys(): KnockoutComputed<string[]>;
    _values(): KnockoutComputed<any[]>;
    _clone(object: T): KnockoutComputed<T>;
    _isEmpty(object: any): KnockoutComputed<boolean>;
}

interface KnockoutObservableArrayFunctions<T> extends KnockoutUnderscoreArrayFunctions<T> {
    indexOf(value: T, isSorted?: boolean): number;
    lastIndexOf(value: T, from?: number): number;
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
