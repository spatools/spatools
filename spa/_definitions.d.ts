/// <reference path="../_references.d.ts" />
/// <reference path="../Scripts/typings/requirejs/require.d.ts" />
/// <reference path="../build/spatools.d.ts" />

interface Size {
    width: number;
    height: number;
}

interface CommandOptions {
    execute(): any;
    canExecute? (): boolean;
    context?: any;
}

interface AsyncCommandOptions {
    execute($data: any, complete?: () => void): any;
    canExecute? (isExecuting?: boolean): boolean;
    context?: any;
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

interface ISimpleStorage {
    length: number;

    key(index: any): any;
    getItem(key: any): any;
    setItem(key: any, value: any): void;
    removeItem(key: any): void;
    clear(): void
}