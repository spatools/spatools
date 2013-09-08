/// <reference path="../_definitions.d.ts" />

var sourceRegex = /^text!(.+)/,
    sources: { [key: string]: RequireSource } = {};

//#region Require Template Source

export interface RequireTemplateObservable extends KnockoutObservable<string> {
    data: {};
}

export interface RequireSourceOptions {
    loadingTemplate?: string;
    afterRender?: () => any;
}

export class RequireSource {
    public name: string;
    public template: RequireTemplateObservable;
    public isLoading: boolean = false;
    public isLoaded: boolean = false;

    constructor(
        public source: string,
        public options: RequireSourceOptions = {}) {

            if (!(typeof source === "string"))
                throw new Error("Require Template Source need string template source");

            if (sources[source])
                return sources[source];

            this.name = source.match(sourceRegex)[1];
            
            var tmpl: any = ko.observable(this.options.loadingTemplate || RequireEngine.defaults.loading);
            tmpl.data = {};

            this.template = tmpl;

            if (options.afterRender) {
                var origAfterRender = options.afterRender;
                this.options.afterRender = () => this.isLoaded && origAfterRender.apply(this.options, arguments);
            }

            sources[source] = this;
    }

    public static isRequireTemplateSource(value: string): boolean {
        return sourceRegex.test(value);
    }

    public text(): string;
    public text(value: string): void;
    public text(value?: string): any {
        if (!this.isLoaded)
            this.loadTemplate();

        if (arguments.length === 0) {
            return this.template();
        }
        else {
            this.template(arguments[0]);
        }
    }

    public data(key: string): any;
    public data(key: string, value: any): void;
    public data(key: string, value?: any): any {
        if (arguments.length === 1) {
            if (key === "precompiled")
                this.template(); // register observable for auto template refresh

            return this.template.data[key];
        }

        this.template.data[key] = value;
    }

    public loadTemplate(): void {
        if (this.isLoading)
            return;

        this.isLoading = true;
        require([this.source], template => {
            this.data("precompiled", null);

            this.isLoaded = true;
            this.isLoading = false;

            this.template(template);
        });
    }
}

ko.templateSources.require = RequireSource;

//#endregion

//#region Require Template Engine

//#region Try Typescript fails
/*
export class RequireEngine extends ko.templateEngine {
    private innerEngine: KnockoutTemplateEngine;
    public allowTemplateRewritting: boolean = false;

    public static defaults: { loading: string; engine: any } = {
        loading: "<div class='template-loading'></div>",
        engine: ko.nativeTemplateEngine
    }

    constructor(innerEngine?: KnockoutTemplateEngine) {
        this.innerEngine = innerEngine || new RequireEngine.defaults.engine();
    }

    public makeTemplateSource(template: any, templateDocument: any, options?: any): any {
        // Require template
        if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
            return new RequireSource(template, options);
        }

        //Call base method
        return this.innerEngine.makeTemplateSource.call(this.innerEngine, template, templateDocument);
    }

    public renderTemplateSource(templateSource: any, bindingContext: KnockoutBindingContext, options?: any): any {
        return this.innerEngine.renderTemplateSource.apply(this.innerEngine, arguments);
    }

    public renderTemplate(template: any, bindingContext: KnockoutBindingContext, options: any, templateDocument: any): any {
        var templateSource = this.makeTemplateSource(template, templateDocument, options);
        return this.renderTemplateSource(templateSource, bindingContext, options);
    }
}
*/
//#endregion

export var RequireEngine: any = function (innerEngine) {
    this['allowTemplateRewriting'] = false;
    this.innerEngine = innerEngine || new RequireEngine.defaults.engine();
};

RequireEngine.defaults = {};
RequireEngine.defaults.loading = "<div class='template-loading'></div>";
RequireEngine.defaults.engine = ko.nativeTemplateEngine;

RequireEngine.prototype = new ko.templateEngine();
RequireEngine.prototype.addTemplate = function (key: string, template: string): void {
    if (!RequireSource.isRequireTemplateSource(key))
        return;

    define(key, [], () => template);
};
RequireEngine.prototype.makeTemplateSource = function (template: any, templateDocument: any, options?: any): any {
    // Require template
    if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
        return new ko.templateSources.require(template, options);
    }

    //Call base method
    return this.innerEngine.makeTemplateSource.call(this.innerEngine, template, templateDocument);
};
RequireEngine.prototype.renderTemplateSource = function (templateSource: any, bindingContext: KnockoutBindingContext, options?: any): any {
    return this.innerEngine.renderTemplateSource.apply(this.innerEngine, arguments);
};
RequireEngine.prototype.renderTemplate = function (template: any, bindingContext: KnockoutBindingContext, options: any, templateDocument: any): any {
    var templateSource = this.makeTemplateSource(template, templateDocument, options);
    return this.renderTemplateSource(templateSource, bindingContext, options);
};

export var defaultInstance = new RequireEngine(new ko.nativeTemplateEngine());

export function setTemplateEngine(innerEngine?: KnockoutTemplateEngine): void {
    ko.setTemplateEngine(new RequireEngine(innerEngine));
}

ko.requireTemplateEngine = RequireEngine;

//#endregion