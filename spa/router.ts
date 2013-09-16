/// <reference path="_definitions.d.ts" />
/// <reference path="../Scripts/typings/sammyjs/sammyjs.d.ts" />

export interface RouteBrokerResult {
    value: boolean;
    message: string;
}

export interface RouteBroker {
    canLeave(): RouteBrokerResult;
    setCallback(callback: () => RouteBrokerResult);
}

export interface Presenter {
    transitionTo(view: string, subview: string, option: any): void;
}

export interface Route {
    view: string;
    subview?: string;

    route?: string;
    title?: string;
    callback?: (params?: any) => any;
    isDefault?: boolean;
    
    routes?: Route[];
}

export interface Router {
    /** Get current url hash */
    currentHash: KnockoutObservable<string>;
    /** Get or set default route */
    defaultRoute: string;
    /** Get or set default title */
    defaultTitle: string;
    /** Get whether is currently redirecting */
    isRedirecting: boolean;
    /** Get or set startupUrl */
    startupUrl: string;

    /** Go back */
    navigateBack(): void;
    /** Go forward */
    navigateNext(): void;
    /** Navigate to specified url */
    navigateTo(url: string): void;

    /** Register a route or a collection of routes */
    register(route: Route): void;
    /** Start using route broker to block navigation */
    registerRouteBroker(): void;

    /** Change navigation presenter to customize transitions between pages */
    setPresenter(presenter: Presenter): void;
    /** Start router */
    run(url?: string): void;
}

export var routeBroker: RouteBroker = (function () {
    var canLeaveCallback: () => RouteBrokerResult,
        setCallback = function (callback: () => RouteBrokerResult): void {
            canLeaveCallback = callback;
        },

        canLeave = function (): RouteBrokerResult {
            var result = { value: true, message: "" };
            if (canLeaveCallback)
                result = canLeaveCallback();

            return result;
        };

    return {
        canLeave: canLeave,
        setCallback: setCallback
    };
})();

export var presenter: Presenter = (function () {
    var
        last = {
            view: null,
            subview: null
        },
        classes = {
            view: ".view",
            subview: ".subview",
        },

        transitionTo = function (view: string, subview: string, option: any): void {
            if (last.view !== view) {
                $(classes.view).hide();
                $(view).show();
                last.view = view;
            }

            if (last.subview !== subview) {
                $(classes.subview).hide();

                if (subview)
                    $(subview).show();

                last.subview = subview;
            }
        };

    return {
        transitionTo: transitionTo
    };
})();

export var router: Router = (function () {
    var currentHash = ko.observable(window.location.hash),
        defaultRoute = "",
        defaultTitle = "Touch it - ",
        isRedirecting = false,
        startupUrl = "#/",
        presenter = presenter,
        brokeCallback: (message: string) => any,

        sammy = Sammy(function () {
            if (Sammy.Title) {
                this.use(Sammy.Title);
                this.setTitle(defaultTitle);
            }
        }),

        navigateBack = function (): void {
            window.history.back();
        },
        navigateNext = function (): void {
            window.history.forward();
        },
        navigateTo = function (url: string): void {
            sammy.setLocation(url);
        },

        register = function (options: Route) {
            if (options.routes) {
                _.each(options.routes, function (route) {
                    registerRoute({
                        route: route.route,
                        title: route.title,
                        callback: route.callback || options.callback,
                        view: options.view,
                        subview: route.subview || options.subview,
                        isDefault: !!route.isDefault
                    });
                });
                return;
            }

            registerRoute(options);
        },
        registerRouteBroker = function (_brokeCallback?: (message: string) => any) {
            if (_brokeCallback)
                brokeCallback = _brokeCallback;

            sammy.before(/.*/, function () {
                var context = this,
                    response = routeBroker.canLeave();

                if (!isRedirecting && !response.value) {
                    isRedirecting = true;
                    brokeCallback && brokeCallback(response.message);
                    context.app.setLocation(currentHash);
                }
                else {
                    isRedirecting = false;
                    currentHash = context.app.getLocation();
                }

                return response.value;
            });
        },
        /** Register a route */
        registerRoute = function (options: Route) {
            if (!options.callback) {
                throw new Error("callback must be specified");
            }

            if (options.isDefault)
                defaultRoute = options.route;

            sammy.get(options.route, function (context) {
                options.callback(context.params);

                if (options.view) {
                    presenter.transitionTo(options.view, options.subview, context);

                    $("a[href*='#/']").removeClass("selected");

                    var str = options.route;
                    do {
                        $("a[href='" + str + "']").addClass("selected");
                        str = str.substring(0, str.lastIndexOf("/"));
                    } while (str !== "#");
                }

                if (Sammy.Title) {
                    this.use(Sammy.Title);
                    this.setTitle(options.title);
                }
            });
        },

        setPresenter = function (_presenter: Presenter): void {
            presenter = _presenter;
        },
        run = function (url?: string): void {
            init();
            sammy.run(url);
        },

        init = function (): void {
            window.addEventListener("hashchange", () => currentHash(window.location.hash), false);
        };

    return {
        currentHash: currentHash,
        defaultRoute: defaultRoute,
        defaultTitle: defaultTitle,
        isRedirecting: false,
        startupUrl: "",

        navigateBack: navigateBack,
        navigateNext: navigateNext,
        navigateTo: navigateTo,

        register: register,
        registerRouteBroker: registerRouteBroker,

        setPresenter: setPresenter,
        run: run
    };
})();
