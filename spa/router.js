define(["require", "exports"], function(require, exports) {
    exports.routeBroker = (function () {
        var canLeaveCallback, setCallback = function (callback) {
            canLeaveCallback = callback;
        }, canLeave = function () {
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

    exports.presenter = (function () {
        var last = {
            view: null,
            subview: null
        }, classes = {
            view: ".view",
            subview: ".subview"
        }, transitionTo = function (view, subview, option) {
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

    exports.router = (function () {
        var currentHash = ko.observable(window.location.hash), defaultRoute = '', defaultTitle = 'Touch it - ', isRedirecting = false, startupUrl = '#/', presenter = presenter, brokeCallback, sammy = Sammy(function () {
            if (Sammy.Title) {
                this.use(Sammy.Title);
                this.setTitle(defaultTitle);
            }
        }), navigateBack = function () {
            window.history.back();
        }, navigateNext = function () {
            window.history.forward();
        }, navigateTo = function (url) {
            sammy.setLocation(url);
        }, register = function (options) {
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
        }, registerRouteBroker = function (_brokeCallback) {
            if (_brokeCallback)
                brokeCallback = _brokeCallback;

            sammy.before(/.*/, function () {
                var context = this, response = exports.routeBroker.canLeave();

                if (!isRedirecting && !response.value) {
                    isRedirecting = true;
                    brokeCallback && brokeCallback(response.message);
                    context.app.setLocation(currentHash);
                } else {
                    isRedirecting = false;
                    currentHash = context.app.getLocation();
                }

                return response.value;
            });
        }, registerRoute = function (options) {
            if (!options.callback)
                throw new Error("callback must be specified");

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
                    } while(str !== "#");
                }

                if (Sammy.Title) {
                    this.use(Sammy.Title);
                    this.setTitle(options.title);
                }
            });
        }, setPresenter = function (_presenter) {
            presenter = _presenter;
        }, run = function (url) {
            init();
            sammy.run(url);
        }, init = function () {
            window.addEventListener("hashchange", function () {
                return currentHash(window.location.hash);
            }, false);
        };

        return {
            currentHash: currentHash,
            defaultRoute: defaultRoute,
            defaultTitle: defaultTitle,
            isRedirecting: false,
            startupUrl: '',
            navigateBack: navigateBack,
            navigateNext: navigateNext,
            navigateTo: navigateTo,
            register: register,
            registerRouteBroker: registerRouteBroker,
            setPresenter: setPresenter,
            run: run
        };
    })();
});
