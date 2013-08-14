/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="Scripts/typings/jqueryui/jqueryui.d.ts" />
/// <reference path="Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="Scripts/typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="Scripts/typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="Scripts/typings/underscore/underscore-typed.d.ts" />
/// <reference path="Scripts/typings/moment/moment.d.ts" />
/// <reference path="Scripts/typings/globalize/globalize.d.ts" />

declare function escape(text: string): string;
declare function unescape(text: string): string;

interface StyleSheet {
    cssText: string;
}

interface Window {
    escape(text: string): string;
    unescape(text: string): string;
    moment: Moment;
    Globalize: GlobalizeStatic;
    globalStorage: Storage;
    ActiveXObject: any;

    webkitIndexedDB: IDBFactory;
    mozIndexedDB: IDBFactory;
    IDBTransaction: IDBTransaction;
    webkitIDBTransaction: IDBTransaction;
    msIDBTransaction: IDBTransaction;
    IDBKeyRange: IDBKeyRange;
    webkitIDBKeyRange: IDBKeyRange;
    msIDBKeyRange: IDBKeyRange;
}

interface Document {
    fullScreen: any;
    webkitIsFullScreen: any;
}

interface EventTarget {
    result?: any;
}

interface IDBVersionChangeEvent {
    target: IDBVersionChangeEventTarget;
}

interface IDBVersionChangeEventTarget extends EventTarget {
    transaction?: IDBTransaction;
}

interface MSEventObj {
    eventType: string;
}

interface KnockoutStatic {
    isWriteableObservable: (observable: any) => bool;
}

interface KnockoutObservableFunctions {
    equalityComparer: (a: any, b: any) => bool;
}

interface KnockoutSubscribableFunctions {
    notifySubscribers: (value: any, event?: string) => void;
}

interface Function {
    result: any;
}