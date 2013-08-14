define(["require", "exports", "../../utils"], function(require, exports, __utils__) {
    /// <reference path="../../_definitions.d.ts" />
    var utils = __utils__;

    exports.defaults = {
        cssClass: 'ui-context',
        width: 190
    };

    var ContextMenu = (function () {
        function ContextMenu(data, container) {
            this.items = ko.observableArray();
            this.container = container;

            this.cssClass = utils.createObservable(data.cssClass, container ? container.cssClass() : exports.defaults.cssClass);
            this.width = utils.createObservable(data.width, exports.defaults.width);
            this.name = utils.createObservable(data.name, '');

            for (var i in data.items) {
                var item = data.items[i];
                this.items.push(new ContextMenuItem(item, this));
            }
        }
        return ContextMenu;
    })();
    exports.ContextMenu = ContextMenu;

    var ContextMenuItem = (function () {
        function ContextMenuItem(data, container) {
            this.dataItem = {};
            this.container = container;
            this.text = utils.createObservable(data.text, '');
            this.iconCssClass = utils.createObservable(data.iconCssClass, '');
            this.separator = utils.createObservable(data.separator, false);
            this.run = typeof data.run === 'function' ? data.run : eval(data.run);
            this.width = ko.observable(container.width());
            this.disabled = ko.observable(false);

            if (data.items !== undefined && data.items.length > 0) {
                this.subMenu = new ContextMenu({ items: data.items }, container);
            }
        }
        ContextMenuItem.prototype.hasChildren = function () {
            return !!this.subMenu;
        };

        ContextMenuItem.prototype.addDataItem = function (dataItem) {
            this.dataItem = dataItem;
            if (this.hasChildren()) {
                for (var i = 0; i < this.subMenu.items().length; i += 1) {
                    this.subMenu.items()[i].addDataItem(dataItem);
                }
            }
        };

        ContextMenuItem.prototype.itemWidth = function () {
            return (this.separator() ? (this.width() - 4) : (this.width() - 6)) + 'px';
        };
        ContextMenuItem.prototype.labelWidth = function () {
            return (this.width() - 41) + 'px';
        };

        ContextMenuItem.prototype.onClick = function (e) {
            if (this.disabled() || this.run === undefined) {
                return false;
            }

            this.run(this.dataItem);
            $('.ui-context').remove();
        };
        return ContextMenuItem;
    })();
    exports.ContextMenuItem = ContextMenuItem;

    var ContextMenuBuilder = (function () {
        function ContextMenuBuilder(configuration) {
            this.contextMenus = ko.observableArray();
            this.cssClass = utils.createObservable(configuration.cssClass, exports.defaults.cssClass);
            this.build = typeof configuration.build === 'function' ? configuration.build : eval(configuration.build);

            for (var i in configuration.contextMenus) {
                var menu = configuration.contextMenus[i];
                this.contextMenus.push(new ContextMenu(menu, this));
            }
        }
        return ContextMenuBuilder;
    })();
    exports.ContextMenuBuilder = ContextMenuBuilder;

    //#endregion
    //#region Handlers
    function getMaxZIndex($element) {
        var maxZ = 1;

        $element.parents().each(function () {
            var z = $(this).css('zIndex'), _z;

            if (z !== 'auto') {
                _z = parseInt(z, 10);
                if (_z > maxZ) {
                    maxZ = _z;
                }
            }
        });

        return maxZ;
    }

    ko.bindingHandlers.contextmenu = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element), menuContainer, config, menu, parentVM = viewModel, value = ko.utils.unwrapObservable(valueAccessor());

            if (!value)
                return;

            $element.addClass('nocontext').on('contextmenu', function (e) {
                if (value instanceof ContextMenuBuilder) {
                    config = value.build(e, parentVM);
                    menu = value.contextMenus._find(function (x) {
                        return x.name() === config.name;
                    });
                } else {
                    config = { name: value.name() };
                    menu = value;
                }

                // remove any existing menus active
                $('.ui-context').remove();

                if (menu !== undefined) {
                    menuContainer = $('<div></div>').appendTo('body');

                    menu.items._each(function (item) {
                        item.disabled(!!config.disable && config.disable.indexOf(item.text()) !== -1);
                        item.addDataItem(parentVM);
                    });

                    // calculate z-index
                    menu.zIndex = getMaxZIndex($element);

                    var afterRender = function (doms) {
                        $(doms).filter(".ui-context").position({ my: "left top", at: "left bottom", of: e, collision: "flip" });
                    };

                    ko.renderTemplate("text!./menu.html", menu, { afterRender: afterRender }, menuContainer.get(0), "replaceNode");
                }

                return false;
            });

            $('html').click(function () {
                $('.ui-context').remove();
            });
        }
    };

    ko.bindingHandlers.subcontextmenu = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element), value = ko.utils.unwrapObservable(valueAccessor()), width = ko.utils.unwrapObservable(viewModel.width()), cssClass;

            if (value) {
                cssClass = '.' + viewModel.container.cssClass();
                $(cssClass, $element).hide();

                $element.hover(function () {
                    var $parent = $(this);
                    $(cssClass, $parent).first().toggle().position({ my: 'left top', at: 'right top', of: $parent, collision: 'flip' });
                });
            }
        }
    };
});
