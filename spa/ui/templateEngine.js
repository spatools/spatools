define(["require", "exports"], function(require, exports) {
    /// <reference path="../_definitions.d.ts" />
    var sourceRegex = /^text!(.+)/, sources = {};

    var RequireSource = (function () {
        function RequireSource(source, options) {
            if (typeof options === "undefined") { options = {}; }
            var _this = this;
            this.source = source;
            this.options = options;
            this.isLoading = false;
            this.isLoaded = false;
            if (!(typeof source === "string"))
                throw new Error("Require Template Source need string template source");

            if (sources[source])
                return sources[source];

            this.name = source.match(sourceRegex)[1];

            var tmpl = ko.observable(this.options.loadingTemplate || exports.RequireEngine.defaults.loading);
            tmpl.data = {};

            this.template = tmpl;

            if (options.afterRender) {
                var origAfterRender = options.afterRender;
                this.options.afterRender = function () {
                    return _this.isLoaded && origAfterRender.apply(_this.options, arguments);
                };
            }

            sources[source] = this;
        }
        RequireSource.isRequireTemplateSource = function (value) {
            return sourceRegex.test(value);
        };

        RequireSource.prototype.text = function (value) {
            if (!this.isLoaded)
                this.loadTemplate();

            if (arguments.length === 0) {
                return this.template();
            } else {
                this.template(arguments[0]);
            }
        };

        RequireSource.prototype.data = function (key, value) {
            if (arguments.length === 1) {
                if (key === "precompiled")
                    this.template();

                return this.template.data[key];
            }

            this.template.data[key] = value;
        };

        RequireSource.prototype.loadTemplate = function () {
            var _this = this;
            if (this.isLoading)
                return;

            this.isLoading = true;
            require([this.source], function (template) {
                _this.data("precompiled", null);

                _this.isLoaded = true;
                _this.isLoading = false;

                _this.template(template);
            });
        };
        return RequireSource;
    })();
    exports.RequireSource = RequireSource;

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
    exports.RequireEngine = function (innerEngine) {
        this['allowTemplateRewriting'] = false;
        this.innerEngine = innerEngine || new exports.RequireEngine.defaults.engine();
    };

    exports.RequireEngine.defaults = {};
    exports.RequireEngine.defaults.loading = "<div class='template-loading'></div>";
    exports.RequireEngine.defaults.engine = ko.nativeTemplateEngine;

    exports.RequireEngine.prototype = new ko.templateEngine();
    exports.RequireEngine.prototype.addTemplate = function (key, template) {
        if (!RequireSource.isRequireTemplateSource(key))
            return;

        define(key, [], function () {
            return template;
        });
    };
    exports.RequireEngine.prototype.makeTemplateSource = function (template, templateDocument, options) {
        if (typeof template == "string" && RequireSource.isRequireTemplateSource(template)) {
            return new ko.templateSources.require(template, options);
        }

        //Call base method
        return this.innerEngine.makeTemplateSource.call(this.innerEngine, template, templateDocument);
    };
    exports.RequireEngine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        return this.innerEngine.renderTemplateSource.apply(this.innerEngine, arguments);
    };
    exports.RequireEngine.prototype.renderTemplate = function (template, bindingContext, options, templateDocument) {
        var templateSource = this.makeTemplateSource(template, templateDocument, options);
        return this.renderTemplateSource(templateSource, bindingContext, options);
    };

    ko.requireTemplateEngine = exports.RequireEngine;

    function setTemplateEngine(innerEngine) {
        ko.setTemplateEngine(new exports.RequireEngine(innerEngine));
    }
    exports.setTemplateEngine = setTemplateEngine;

    ko.requireTemplateEngine = exports.RequireEngine;
});
