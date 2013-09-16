/// <reference path="../_definitions.d.ts" />

import utils = require("../utils");
import event = require("../event");
import engine = require("./templateEngine");
import ui = require("../ui");

export var defaults = {
    cssClass: 'ui-editor',
    buttonSet: 'default',
    updateMode: 'blur',

    defaultFontFamily: "Arial",
    defaultFontSize: "11px",
    fontFamilies: ko.observableArray(["Arial", "Verdana", "Times New Roman", "Comic Sans Ms", "Helvetica"]),
    fontSizes: _.map(["8|8px", "9|9px", "10|10px", "11|11px", "12|12px", "14|14px", "16|16px", "18|18px", "20|20px", "22|22px", "24|24px", "26|26px", "28|28px", "36|36px", "48|48px", "72|72px"], function (item) { var sizes = item.split('|'); return { text: sizes[0], value: sizes[1] }; }),

    popupOffset: {
        top: -15,
        left: -80
    }
};

//#region Private Members

var rgbRegex = /rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)/,
    rgbRegexGlobal = /rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)/g,
    blockElements = ["div", "p", "ul", "ol", "dl", "header", "article", "aside", "section", "nav"],

    doc = document;

function initRangy(): void {
    if (window.rangy && !window.rangy.initialized) {
        window.rangy.init();
        window.rangy.createMissingNativeApi();
    }
}
function setSingleRange(selection: Selection, range: Range): void {
    selection.removeAllRanges();
    selection.addRange(range);
}
function useStyleWithCss(): void {
    try {
        doc.execCommand("styleWithCSS", 0, true);
    } catch (e) {
        try {
            doc.execCommand("useCSS", 0, true);
        } catch (e) {
            try {
                doc.execCommand('styleWithCSS', false, true);
            }
            catch (e) {
            }
        }
    }
}
function setIfChanged<T>(obs: KnockoutObservable<T>, value: T): void {
    if (obs() !== value)
        obs(value);
}

function createEditorPopup(editor: Editor, callback: (HTMLElement) => any): void {
    var popup = doc.createElement("div");
    doc.body.appendChild(popup);

    ko.renderTemplate("text!editor-template.html", editor, { afterRender: elements => callback(elements[0]), templateEngine: engine.defaultInstance }, popup, "replaceNode");
}
function removeEditorPopup(editor: Editor): void {
    var $popup = $(editor.popup);

    editor.endEdit();
    $popup.fadeOut(200, () => $popup.remove());
}

/** Select word from a text and a position. */
function getNearWord(text: string, index: number): { start: number; end: number } {
    var nextChar = text.substr(index, 1),
        prevChar = text.substr(index - 1, 1),
        charRegex = /\w/,
        end: number,
        start: number = end = index;

    if (!prevChar || !nextChar || prevChar === ' ' || nextChar === ' ')
        return null;

    while (prevChar !== ' ' && charRegex.test(prevChar) && start >= 0) {
        prevChar = text[--start];
    }

    while (nextChar !== ' ' && charRegex.test(nextChar) && end < text.length) {
        nextChar = text[++end];
    }

    if (start !== 0) start = start + 1; // don't take white space

    return { start: start, end: end };
}
function selectWord(_selection?: Selection, _range?: Range): Range {
    var selection = _selection || window.getSelection(),
        range = _range || selection.getRangeAt(0),
        oldRange = range.cloneRange();

    if (range.collapsed) {
        var container = range.startContainer,
            pos = getNearWord(container.textContent, range.startOffset);

        if (pos) {
            range.setStart(container, pos.start);
            range.setEnd(container, pos.end);
            setSingleRange(selection, range);

            return oldRange;
        }
    }

    return null;
}

function formatFontFamily(font: string, fromDoc?: boolean): string {
    if (fromDoc) {
        return font.replace(/'/g, "");
    }
    else {
        return "'" + font + "'";
    }
}
function docColorToHex(docColor: any): string {
    if (docColor.length > 0 && docColor[0] === '#')
        return docColor;
    else if (parseInt(docColor, 10) == docColor) { // IE
        var color = utils.str_pad(parseInt(docColor, 10).toString(16), 6, '0');
        if (color === "0") color = "000000";
        return "#" + color.substr(4, 2) + color.substr(2, 2) + color.substr(0, 2); // IE is working in inverse order (BGR)
    }
    else if (rgbRegex.test(docColor)) { // rgbColor
        var matches = docColor.match(rgbRegex),
            color = utils.str_pad(parseInt(matches[1], 10).toString(16), 2, '0') +
            utils.str_pad(parseInt(matches[2], 10).toString(16), 2, '0') +
            utils.str_pad(parseInt(matches[3], 10).toString(16), 2, '0');

        return "#" + color;
    }
}
function convertColorsToHex(html: string): string {
    return html.replace(rgbRegexGlobal, docColorToHex);
}

function setFontFamily(editor: Editor): void {
    var fontfamily = formatFontFamily(doc.queryCommandValue('fontname'), true),
        families = ko.utils.unwrapObservable(editor.fontFamilies);

    if (!_.contains(families, fontfamily))
        fontfamily = ko.utils.unwrapObservable(editor.defaultFontFamily);

    setIfChanged(editor.formatting.fontfamily, fontfamily);
}
function setSelectionFormatting(editor: Editor): void {
    var format = editor.formatting,
        range = window.getSelection().getRangeAt(0),
        align, style, fontSize;

    if (range.startContainer === range.endContainer) {
        style = window.getComputedStyle(range.startContainer.parentNode);
        fontSize = style.fontSize;
    }
    else {
        style = window.getComputedStyle(range.startContainer.parentNode);
        fontSize = style.fontSize;

        style = window.getComputedStyle(range.endContainer.parentNode);
        if (fontSize !== style.fontSize) fontSize = null;
    }

    setIfChanged(format.bold, document.queryCommandState('bold'));
    setIfChanged(format.italic, document.queryCommandState('italic'));
    setIfChanged(format.underline, document.queryCommandState('underline'));

    setIfChanged(format.subscript, document.queryCommandState('subscript'));
    setIfChanged(format.superscript, document.queryCommandState('superscript'));

    //alignment
    if (document.queryCommandState("justifyleft")) align = "left";
    else if (document.queryCommandState("justifycenter")) align = "center";
    else if (document.queryCommandState("justifyright")) align = "right";
    else if (document.queryCommandState("justifyfull")) align = "full";
    if (align) setIfChanged(format.align, align);

    setFontFamily(editor);
    setIfChanged(format.color, document.queryCommandValue('forecolor'));
    if (fontSize) setIfChanged(format.fontsize, fontSize);
}
function setEnabledCommands(editor: Editor): void {
    var commands = editor.commands;
    setIfChanged(commands.undo, document.queryCommandEnabled('undo'));
    setIfChanged(commands.redo, document.queryCommandEnabled('redo'));

    setIfChanged(commands.copy, document.queryCommandEnabled('copy'));
    setIfChanged(commands.cut, document.queryCommandEnabled('cut'));
    setIfChanged(commands.paste, document.queryCommandEnabled('paste'));

    setIfChanged(commands.unlink, document.queryCommandEnabled('unlink'));
}

function _setFontSizeSpecific(element: JQuery, startOffset: number, endOffset: number, range: Range, fontsize): void {
    var el = element.get(0),
        toWrap, text, result, span;

    if (el) {
        if (el.nodeType === 3) {
            //text = el.textContent;
            //toWrap = text.substring(startOffset, endOffset || text.length);
            //result = text.replace(new RegExp("(" + toWrap + ")"), "<span style='font-size: " + fontsize + "'>$&</span>");

            range.selectNode(el);

            span = document.createElement("span");
            span.style.fontSize = fontsize;
            range.surroundContents(span);
        }
        else {
            element.css("font-size", fontsize);
        }
    }
}
function _setFontSizeRecursive(parent: JQuery, start: JQuery, end: JQuery, startOffset: number, endOffset: number, range: Range, fontsize) {
    var startChild = start.parentsUntil(parent).last(),
        endChild = end.parentsUntil(parent).last(),
        _s, _e;

    if (!startChild.get(0)) startChild = start;
    if (!endChild.get(0)) endChild = end;

    startChild.nextUntil(endChild).each(function () {
        var $this = $(this), text = $this.text();
        if (!text || text === "") {
            $this.remove();
            return;
        }

        $this.css("font-size", fontsize);
    });

    if (start.get(0) === end.get(0)) {
        _setFontSizeSpecific(start, startOffset, endOffset, range, fontsize);
    }
    else {
        if (startChild.get(0) === start.get(0))
            _setFontSizeSpecific(start, startOffset, 0, range, fontsize);
        else
            _setFontSizeRecursive(startChild, start, startChild.children().last(), startOffset, 0, range, fontsize);


        if (endChild.get(0) === end.get(0))
            _setFontSizeSpecific(end, 0, endOffset, range, fontsize);
        else
            _setFontSizeRecursive(endChild, endChild.children().first(), end, 0, endOffset, range, fontsize);
    }
}
function setFontSize(editor: Editor, range: Range, fontsize): void {
    var ancestor = range.commonAncestorContainer,
        start = range.startContainer,
        end = range.endContainer,
        span: any;

    if (start === end) {
        if (range.startOffset === 0 && range.endOffset === end.textContent.length) {
            span = start.parentNode;
            span.style.fontSize = fontsize;
        }
        else {
            span = document.createElement("span");
            span.style.fontSize = fontsize;
            range.surroundContents(span);
        }
    }
    else {
        _setFontSizeRecursive($(ancestor), $(start), $(end), range.startOffset, range.endOffset, range, fontsize);
    }
}

//#endregion

//#region Prompts

export var prompts = {
    link: function (callback: (result: { href: string; title: string; target: string }) => any): void {
        var url = prompt("Please enter link URL :", "http://");
        callback({
            href: url,
            title: "",
            target: ""
        });
    },
    color: function (callback: (color: string) => any): void {
        callback(prompt("Please enter some color code :", "#f12345"));
    },
    image: function (callback: (result: { src: string; alt: string; title: string; width: number; height: number; }) => any): void {
        var url = prompt("Please enter image URL :", "http://");
        callback({
            src: url,
            alt: "",
            title: "",
            width: null,
            height: null
        });
    },
    html: function (callback: (result: { content: string; insert: boolean }) => any): void {
        var html = prompt("Please enter HTML string :", "<p></p>");
        callback({
            content: html,
            insert: true
        });
    },
    code: function (callback: (result: { content: string; language: string; mode: string; mimeType: string }) => any): void {
        var text = prompt("Please enter some code :", "var myVar = 1 << 2 * 2 >> 4;");
        callback({
            content: text,
            language: 'text/javascript',
            mode: "",
            mimeType: "text/javascript"
        });
    }
};

//#endregion

//#region Commands

export var commands = {
    //#region Utility Commands

    execCommandOnBlock: function (command: string, showUi?: boolean, value?: any): void {
        showUi = showUi || false;
        value = value || null;

        if (utils.isIE) {
            var selection = window.getSelection(),
                range = selection.getRangeAt(0).cloneRange(),
                parent = range.commonAncestorContainer.parentNode;

            if (range.collapsed) {
                selection.selectAllChildren(parent);
                doc.execCommand(command, showUi, value);
                setSingleRange(selection, range);
                return;
            }
        }

        doc.execCommand(command, showUi, value);
    },
    execCommandOnSelectionOrWord: function (command: string, showUi?: boolean, value?: any): void {
        showUi = showUi || false;
        value = value || null;

        var oldRange = selectWord();
        if (oldRange !== null) {
            doc.execCommand(command, showUi, value);

            setSingleRange(window.getSelection(), oldRange);
            return;
        }

        doc.execCommand(command, showUi, value);
    },
    insertNode: function (node: Node, select?: boolean, goToEnd?: boolean): void {
        var selection = window.getSelection(),
            range = selection.getRangeAt(0);

        if (range) {
            range.deleteContents();
            range.insertNode(node);

            if (select) {
                range.selectNodeContents(node);
            }

            if (goToEnd) {
                range.setEndAfter(node);
                range.setStartAfter(node);
            }

            setSingleRange(selection, range);
        }
    },
    formatBlock: function (tagName: string): void {
        tagName = tagName || "p";
        tagName = "<" + tagName + ">";

        commands.execCommandOnBlock('formatBlock', false, tagName);
    },

    //#endregion

    //#region Editing Commands

    undo: function (): void {
        this.focus();
        doc.execCommand("undo", false, null);
        this.setHasChanged();
    },
    redo: function (): void {
        this.focus();
        doc.execCommand("redo", false, null);
        this.setHasChanged();
    },

    cut: function (): void {
        this.focus();
        doc.execCommand("cut", false, null);
        this.setHasChanged();
    },
    copy: function (): void {
        this.focus();
        doc.execCommand("copy", false, null);
    },
    paste: function (): void {
        this.focus();
        doc.execCommand("paste", false, null);
        this.setHasChanged();
    },

    //#endregion

    //#region Inline Commands

    bold: function (): void {
        commands.execCommandOnSelectionOrWord('bold');
        this.setHasChanged();
    },
    italic: function (): void {
        commands.execCommandOnSelectionOrWord('italic');
        this.setHasChanged();
    },
    underline: function (): void {
        commands.execCommandOnSelectionOrWord('underline');
        this.setHasChanged();
    },
    subscript: function (): void {
        commands.execCommandOnSelectionOrWord('subscript');
        this.setHasChanged();
    },
    superscript: function (): void {
        commands.execCommandOnSelectionOrWord('superscript');
        this.setHasChanged();
    },
    unlink: function (): void {
        commands.execCommandOnSelectionOrWord('unlink');
        this.setHasChanged();
    },
    fontfamily: function (family: string): void {
        commands.execCommandOnSelectionOrWord("fontname", false, formatFontFamily(family));
        this.setHasChanged();
    },
    fontsize: function (size): void {
        var actualSize = this.formatting.fontsize(),
            index = _.index(defaults.fontSizes, s => s.value == actualSize),
            selection = window.getSelection(),
            oldRange, range, span;

        switch (size) {
            case '+':
                size = index < defaults.fontSizes.length - 1 ? defaults.fontSizes[index + 1].value : actualSize;
                break;
            case '-':
                size = index > 0 ? defaults.fontSizes[index - 1].value : actualSize;
                break;
        }

        oldRange = selectWord(selection);
        range = selection.getRangeAt(0);

        setFontSize(this, range, size);

        if (oldRange !== false)
            setSingleRange(selection, oldRange);

        this.focus();
        this.setHasChanged();
    },
    clearFormat: function () {
        commands.execCommandOnSelectionOrWord('removeFormat');
        this.focus();
        this.setHasChanged();
    },

    //#endregion

    //#region Block Commands

    ul: function (): void {
        commands.execCommandOnBlock('insertunorderedlist');
        this.focus(); // needed as we loose focus when applied
        this.setHasChanged();
    },
    ol: function (): void {
        commands.execCommandOnBlock('insertorderedlist');
        this.focus(); // needed as we loose focus when applied
        this.setHasChanged();
    },
    paragraph: function (): void {
        commands.formatBlock("p");
        this.setHasChanged();
    },
    heading: function (nb: number): void {
        if (nb > 0 && nb < 7) {
            commands.formatBlock("h" + nb.toString());
            this.setHasChanged();
        }
    },
    align: function (direction: string): void {
        switch (direction) {
            case 'left':
                commands.execCommandOnBlock('justifyleft');
                break;
            case 'center':
                commands.execCommandOnBlock('justifycenter');
                break;
            case 'right':
                commands.execCommandOnBlock('justifyright');
                break;
            case 'justify':
                commands.execCommandOnBlock('justifyfull');
                break;
        }
        this.setHasChanged();
    },
    blockquote: function (): void {
        commands.formatBlock("blockquote");
        this.setHasChanged();
    },
    pre: function (): void {
        commands.formatBlock("pre");
        this.setHasChanged();
    },

    //#endregion

    //#region Special Commands

    color: function (): void {
        var self = this;
        prompts.color(function (color) {
            commands.execCommandOnSelectionOrWord("foreColor", false, color);
            self.setHasChanged();
        });
    },
    link: function (): void {
        var self = this,
            selection = window.getSelection(),
            oldRange = selection.getRangeAt(0).cloneRange(),
            range = oldRange.cloneRange();

        if (range.startContainer.parentNode.tagName === 'A' || range.endContainer.parentNode.tagName === 'A') {
            commands.unlink.call(this);
        }
        else {
            prompts.link(function (link) {
                if (utils.isNullOrWhiteSpace(link.href))
                    return;

                if (range.collapsed) {
                    var container = range.startContainer,
                        pos = getNearWord(container.textContent, range.startOffset);

                    if (pos) {
                        range.setStart(container, pos.start);
                        range.setEnd(container, pos.end);
                        setSingleRange(selection, range);
                    }
                    else
                        commands.text.call(this, link.href);
                }

                doc.execCommand("CreateLink", false, link.href);

                if (utils.isIE)
                    setSingleRange(selection, oldRange);

                range = selection.getRangeAt(0);
                if (range.startContainer.parentNode.tagName === 'A') {
                    var a: any = range.startContainer.parentNode;

                    if (!utils.isNullOrWhiteSpace(link.title))
                        a.setAttribute("title", link.title);

                    if (!utils.isNullOrWhiteSpace(link.target))
                        a.setAttribute("target", link.target);
                }

                self.focus();
                self.setHasChanged();
            });
        }
    },
    image: function () {
        var self = this,
            selection = window.getSelection(),
            range = selection.getRangeAt(0);

        prompts.image(function (image) {
            if (utils.isNullOrWhiteSpace(image.src))
                return;

            var img = doc.createElement('img');
            img.setAttribute('src', image.src);

            if (!utils.isNullOrWhiteSpace(image.alt))
                img.setAttribute('alt', image.alt);

            if (!utils.isNullOrWhiteSpace(image.title))
                img.setAttribute('title', image.title);

            if (!utils.isUndefined(image.width))
                img.style.width = image.width + "px";

            if (!utils.isUndefined(image.height))
                img.style.height = image.height + "px";

            commands.insertNode(img, false, true);

            self.focus();
            self.setHasChanged();
        });
    },
    text: function (text: string): void {
        var selection = window.getSelection(),
            range = selection.getRangeAt(0);

        if (range) {
            var node = doc.createTextNode(text);
            range.insertNode(node);
            range.selectNode(node);

            setSingleRange(selection, range);
        }
        this.focus();
    },
    html: function (): void {
        var self = this;
        prompts.html(function (html) {
            var content = html.content;
            if (html.insert)
                content = this.element.innerHTML + content;

            self.element.innerHTML = html;

            self.focus();
            self.setHasChanged();
        });
    }

    //#endregion
};

//#endregion

//#region Buttons

export var buttons = {
    b: { title: "Bold", description: "make the selected text bold", iconCssClass: "ui-editor-sprite icon-bold", command: "bold" },
    i: { title: "Italic", description: "make the selected text italic", iconCssClass: "ui-editor-sprite icon-italic", command: "italic" },
    u: { title: "Underline", description: "underline the selected text", iconCssClass: "ui-editor-sprite icon-underline", command: "underline" },

    'super': { title: 'Superscript', description: 'make the selected text superscript', iconCssClass: 'ui-editor-sprite icon-superscript', command: 'superscript' },
    sub: { title: 'Subscript', description: 'make the selected text subscript', iconCssClass: 'ui-editor-sprite icon-subscript', command: 'subscript' },

    font: { title: 'FontFamily', description: 'change the selected text font family', options: defaults.fontFamilies, width: '170px', command: 'fontfamily' },
    size: { title: 'FontSize', description: 'change the selected text font size', options: defaults.fontSizes, optionsText: 'text', optionsValue: 'value', width: '40px', command: 'fontsize' },

    sizeup: { title: 'SizeUp', description: 'make the selected text a step bigger', iconCssClass: 'ui-editor-sprite icon-font-size-up', command: 'fontsize', commandArguments: ['+'] },
    sizedown: { title: 'SizeDown', description: 'make the selected text a step lower', iconCssClass: 'ui-editor-sprite icon-font-size-down', command: 'fontsize', commandArguments: ['-'] },

    h1: { title: 'H1', text: '1', description: 'make the selected text a heading 1', command: 'heading', commandArguments: [1] },
    h2: { title: 'H2', text: '2', description: 'make the selected text a heading 2', command: 'heading', commandArguments: [2] },
    h3: { title: 'H3', text: '3', description: 'make the selected text a heading 3', command: 'heading', commandArguments: [3] },
    h4: { title: 'H4', text: '4', description: 'make the selected text a heading 4', command: 'heading', commandArguments: [4] },
    h5: { title: 'H5', text: '5', description: 'make the selected text a heading 5', command: 'heading', commandArguments: [5] },
    h6: { title: 'H6', text: '6', description: 'make the selected text a heading 5', command: 'heading', commandArguments: [6] },
    h: { title: 'Heading', description: 'select a heading number from below', iconCssClass: 'ui-editor-sprite icon-heading', buttons: [] },

    ul: { title: 'Bulletted List', description: 'add a bulletted list', iconCssClass: 'ui-editor-sprite icon-list', command: 'ul' },
    ol: { title: 'Numbered List', description: 'add a numbered list', iconCssClass: 'ui-editor-sprite icon-ordered-list', command: 'ol' },

    p: { title: 'Paragraph', description: 'add a paragraph', iconCssClass: 'ui-editor-sprite icon-paragraph', command: 'paragraph' },

    alignLeft: { title: "AlignLeft", description: "Align the text left", iconCssClass: "ui-editor-sprite icon-align-left", command: "align", commandArguments: ["left"] },
    alignCenter: { title: "AlignCenter", description: "Align the text center", iconCssClass: "ui-editor-sprite icon-align-center", command: "align", commandArguments: ["center"] },
    alignRight: { title: "AlignRight", description: "Align the text right", iconCssClass: "ui-editor-sprite icon-align-right", command: "align", commandArguments: ["right"] },
    alignJustify: { title: "AlignJustify", description: "Justify the text left and right", iconCssClass: "ui-editor-sprite icon-align-justify", command: "align", commandArguments: ["justify"] },

    link: { title: 'Link', description: 'add a link', iconCssClass: 'ui-editor-sprite icon-link', command: 'link' },
    color: { title: 'Color', description: 'change selected text color', iconCssClass: 'ui-editor-sprite icon-color', command: 'color' },
    image: { title: 'Image', description: 'add an image', iconCssClass: 'ui-editor-sprite icon-image', command: 'image' },

    code: { title: 'Code', description: 'add a code block', iconCssClass: 'ui-editor-sprite icon-code', command: 'pre' },
    quote: { title: 'Quote', description: 'add a quote block', iconCssClass: 'ui-editor-sprite icon-quote', command: 'blockquote' },
    html: { title: 'Html', description: 'add a html block', iconCssClass: 'ui-editor-sprite icon-html', command: 'html' },

    copy: { title: 'Copy', description: 'copy the current selection', iconCssClass: 'ui-editor-sprite icon-copy', command: 'copy' },
    cut: { title: 'Cut', description: 'cut the current selection', iconCssClass: 'ui-editor-sprite icon-cut', command: 'cut' },
    paste: { title: 'Paste', description: 'paste the current selection', iconCssClass: 'ui-editor-sprite icon-paste', command: 'paste' },

    undo: { title: 'undo', description: 'undo the last action', iconCssClass: 'ui-editor-sprite icon-undo', command: 'undo' },
    redo: { title: 'redo', description: 'redo last action', iconCssClass: 'ui-editor-sprite icon-redo', command: 'redo' },
    datetime: { title: 'datetime', description: 'insert date in selection', iconCssClass: 'ui-editor-sprite icon-datetime', command: 'text', commandArguments: [new Date().toString()] },

    clearFormat: { title: 'RemoveFormat', description: 'remove formatting from the current selection', iconCssClass: 'ui-editor-sprite icon-clear-format', command: 'clearFormat' },
};
buttons.h.buttons = [
    buttons.h1, buttons.h2, buttons.h3,
    buttons.h4, buttons.h5, buttons.h6
];

export var buttonSets = {
    'default': [
        [buttons.b, buttons.i, buttons.u],
        [buttons.ul, buttons.ol],
        [buttons.alignLeft, buttons.alignCenter, buttons.alignRight],
    ],
    minimal: [
        [buttons.b, buttons.i, buttons.u]
    ],
    advanced: [
        [buttons.b, buttons.i, buttons.u],
        [buttons.h, buttons.super, buttons.sub],
        [buttons.ul, buttons.ol, buttons.p],
        [buttons.alignLeft, buttons.alignCenter, buttons.alignRight, buttons.alignJustify],
        [buttons.link, buttons.image, buttons.clearFormat]
    ],
    full: [
        [
            [buttons.undo, buttons.redo, buttons.clearFormat],
            [buttons.copy, buttons.cut, buttons.paste]
        ],
        [
            [buttons.font, buttons.size],
            [
                buttons.b, buttons.i, buttons.u, buttons.color,
                buttons.super, buttons.sub, buttons.sizeup, buttons.sizedown
            ],
        ],
        [
            [buttons.ul, buttons.ol, buttons.h, buttons.p],
            [buttons.alignLeft, buttons.alignCenter, buttons.alignRight, buttons.alignJustify],
        ],
        [
            [buttons.link, buttons.image, buttons.datetime],
            [buttons.code, buttons.quote]
        ],
    ]
};

//#endregion

//#region Editor

export interface EditorOptions {
    fontFamilies?: string[];
    defaultFontFamily?: string;

    value?: any;
    isEnabled?: any;
    updateMode?: any;

    buttonSet?: string;
    items?: any;
    groups?: any;
}

export class Editor {
    public engine = engine.defaultInstance;
    public value: KnockoutObservable<string>;
    public fontFamilies: KnockoutObservableArray<string>;
    public defaultFontFamily: KnockoutObservable<string>;

    public isEnabled: KnockoutObservable<boolean>;
    public updateMode: KnockoutObservable<string>;

    public element: HTMLElement = null;
    public popup: HTMLElement = null;

    public isUpdatingHtml: boolean = false;
    public isInitialized: KnockoutObservable<boolean> = ko.observable(false);
    public isEditing: KnockoutObservable<boolean> = ko.observable(false);
    public hasChanged: KnockoutObservable<boolean> = ko.observable(false);

    public position: utils.ObservablePosition = {
        top: ko.observable(0),
        left: ko.observable(0)
    };

    public formatting: EditorFormatting = new EditorFormatting();
    public commands: EditorCommands = new EditorCommands();

    public groups: KnockoutObservableArray<EditorGroup>;

    constructor(options?: EditorOptions) {
        options = options || {};
        this.value = utils.createObservable(options.value, "<p></p>");
        this.fontFamilies = options.fontFamilies || defaults.fontFamilies;
        this.defaultFontFamily = utils.createObservable(options.defaultFontFamily, defaults.defaultFontFamily);

        this.isEnabled = utils.createObservable(options.isEnabled, true);
        this.updateMode = utils.createObservable(options.updateMode, defaults.updateMode);

        if (options.buttonSet && buttonSets[options.buttonSet]) {
            options.groups = buttonSets[options.buttonSet];
        }
        else if (!options.groups && options.items) {
            options.groups = [{ items: options.items }];
        }
        else if (!options.buttonSet && !options.groups && !options.items) {
            options.groups = buttonSets.default;
        }

        this.groups = utils.createObservableArray(options.groups, this.createGroup, this);

        this.isEnabled.subscribe(function (enabled) {
            if (!enabled && this.isEditing())
                removeEditorPopup(this);
        }, this);
    }

    public initialize(element: HTMLElement): void {
        if (!this.isInitialized()) {
            this.element = element;
            this.isInitialized(true);
        }
    }
    public changeButtonSet(buttonSet: string): void {
        var set = buttonSets[buttonSet];
        set && this.groups(_.map(set, this.createGroup, this));
    }

    public executeCommand(command: any, args: any): void {
        command = ko.utils.unwrapObservable(command);
        args = ko.utils.unwrapObservable(args);

        if (typeof command === 'function') {
            command.apply(this, [this].concat(args));
        } else if (commands[command]) {
            commands[command].apply(this, args);
            setSelectionFormatting(this);
            setEnabledCommands(this);
        }
    }
    public setPopupPosition(event: JQueryMouseEventObject): void {
        if (this.popup) {
            var
                popupWidth = this.popup.clientWidth,
                popupHeight = this.popup.clientHeight,
                docWidth = doc.body.clientWidth,
                offset = {
                    top: (popupHeight * -1) + defaults.popupOffset.top,
                    left: defaults.popupOffset.left
                },
                position = {
                    top: event.pageY + offset.top,
                    left: event.pageX + offset.left
                };

            if (position.left < 0)
                position.left = 5;
            else if (position.left + popupWidth > docWidth)
                position.left = docWidth - popupWidth;

            this.position.top(position.top);
            this.position.left(position.left);
        }
    }

    public focus(): void {
        if (this.element)
            this.element.focus();
    }
    public keepFocus(): boolean {
        return false;
    }

    public startEdit(popup: HTMLElement): void {
        this.popup = popup;
        this.isEditing(true);
    }
    public endEdit(): void {
        this.isEditing(false);
        this.updateValue();
        this.popup = null;
    }

    public setHasChanged(): void {
        this.hasChanged(true);

        if (this.updateMode() === "immediate")
            this.updateValue();
    }
    public updateValue(): void {
        if (this.element) {
            var html = this.element.innerHTML;
            if (html !== this.value()) {
                this.isUpdatingHtml = true;

                html = convertColorsToHex(html);
                this.value(html);
                this.hasChanged(false);

                this.isUpdatingHtml = false;
            }
        }
    }

    private removeTransitions(): void {
        if (this.popup) {
            var transitionProp = utils.prefixStyle("transition");
            this.popup.style[transitionProp] = "all 0s";
        }
    }
    private restoreTransitions(): void {
        if (this.popup) {
            var transitionProp = utils.prefixStyle("transition");
            this.popup.style[transitionProp] = "";
        }
    }

    private createGroup(group: any): EditorGroup {
        if (group instanceof EditorGroup) {
            group.setEditor(this);
            return group;
        }
        else if (_.isArray(group)) {
            if (group.length > 0 && group[0] && _.isArray(group[0])) {
                group = { rows: group };
                return new EditorGroup(group, this);
            }
            else {
                group = { items: group };
                return new EditorGroup(group, this);
            }
        }
        else {
            return new EditorGroup(group, this);
        }
    }
}

//#endregion

//#region Formatting

export class EditorFormatting {
    public bold = ko.observable(false);
    public italic = ko.observable(false);
    public underline = ko.observable(false);

    public superscript = ko.observable(false);
    public subscript = ko.observable(false);

    public align = ko.observable("left");

    public fontfamily = ko.observable(defaults.defaultFontFamily);
    public fontsize = ko.observable(defaults.defaultFontSize);
    public color = ko.observable("");
}

//#endregion

//#region Enabled Commands

export class EditorCommands {
    public undo = ko.observable(false);
    public redo = ko.observable(false);

    public copy = ko.observable(false);
    public cut = ko.observable(false);
    public paste = ko.observable(false);

    public unlink = ko.observable(false);
}

//#endregion

//#region Editor Group

export interface EditorGroupOptions {
    name?: any;
    rows?: any;
    items?: any;
}

export class EditorGroup {
    public editor: Editor;
    public name: KnockoutObservable<string>;
    public rows: KnockoutObservableArray<EditorRow>;

    public isFirst: KnockoutComputed<boolean>;
    public isLast: KnockoutComputed<boolean>;

    constructor(options: EditorGroupOptions, editor?: Editor) {
        this.editor = editor;

        if (!options.rows && options.items) {
            options.rows = [{ items: options.items }];
        }

        this.name = utils.createObservable(options.name);
        this.rows = utils.createObservableArray(options.rows, this.createRow, this);

        this.isFirst = ko.computed(function () {
            return this.editor.groups.indexOf(this) === 0;
        }, this, { deferEvaluation: true });
        this.isLast = ko.computed(function () {
            return this.editor.groups.indexOf(this) === this.editor.groups.count() - 1;
        }, this, { deferEvaluation: true });
    }

    public setEditor(editor: Editor): void {
        this.editor = editor;
    }

    private createRow(row: any): EditorRow {
        if (row instanceof EditorRow) {
            row.setGroup(this);
            return row;
        }
        else if (_.isArray(row)) {
            row = { items: row };
            return new EditorRow(row, this);
        }
        else {
            return new EditorRow(row, this);
        }
    }
}

//#endregion

//#region Editor Row

export interface IEditorParent {
    editor: Editor;
    group: EditorGroup;
    isSubActive?: KnockoutObservable<boolean>;
}

export interface EditorRowOptions {
    items?: any;
}

export class EditorRow implements IEditorParent {
    public editor: Editor;
    public group: EditorGroup;

    public items: KnockoutObservableArray<EditorItem>;

    constructor(options: EditorRowOptions, group: EditorGroup) {
        this.editor = group.editor;
        this.group = group;

        this.items = utils.createObservableArray(options.items, this.createItem, this);
    }

    public setGroup(group: EditorGroup): void {
        this.editor = group.editor;
        this.group = group;
    }

    private createItem(item: any): EditorItem {
        if (item instanceof EditorItem) {
            item.setParent(this);
            return item;
        }
        else {
            if (item.options)
                return new EditorSelect(item, this);
            else
                return new EditorButton(item, this);
        }
    }
}

//#endregion

//#region Editor Items

export interface EditorItemOptions {
    title?: string;
    text?: string;
    description?: string;
}

export class EditorItem {
    public editor: Editor;
    public group: EditorGroup;
    public parent: IEditorParent;

    public title: string;
    public text: string;
    public description: string;

    public template: string = "none";

    public setParent(parent: IEditorParent): void {
        this.editor = parent.editor;
        this.group = parent.group;
        this.parent = parent;
    }

    public loadData(data: EditorItemOptions): void {
        this.title = data.title || "";
        this.text = data.text || "";
        this.description = data.description || "";
    }

    public keepFocus(): boolean {
        return false;
    }
}

export interface EditorButtonOptions extends EditorItemOptions {
    iconCssClass?: string;
    command: any;
    commandArguments: any;
    buttons?: any;

    isEnabled?: any;
    isActive?: any;
}

export class EditorButton extends EditorItem implements IEditorParent {
    public iconCssClass: string;
    public command: any;
    public commandArguments: any;
    public template: string = "text!editor-button-template.html";

    public buttons: KnockoutObservableArray<EditorButton>;
    public isEnabled: KnockoutSubscribable<boolean>;
    public isActive: KnockoutSubscribable<boolean>;
    public isSubActive: KnockoutObservable<boolean> = ko.observable(false);
    public hasSubMenu: KnockoutComputed<boolean>;

    constructor(options: EditorButtonOptions, parent: IEditorParent) {
        super();
        this.setParent(parent);
        this.loadData(options);

        this.iconCssClass = options.iconCssClass || "";

        this.command = options.command;
        this.commandArguments = options.commandArguments;

        this.buttons = utils.createObservableArray(options.buttons, this.createButton, this);

        if (_.isUndefined(options.isEnabled) && _.isString(options.command)) {
            this.isEnabled = ko.computed(() => {
                if (this.editor && this.editor.commands[this.command]) {
                    return this.editor.commands[this.command]() === true;
                }

                return true;
            });
        }
        else {
            this.isEnabled = utils.createObservable(options.isEnabled, true);
        }

        if (_.isUndefined(options.isActive) && _.isString(options.command)) {
            this.isActive = ko.computed(() => {
                if (this.editor && this.editor.formatting[this.command]) {
                    if (this.commandArguments && this.commandArguments.length > 0) {
                        return this.editor.formatting[this.command]() === this.commandArguments[0];
                    }

                    return this.editor.formatting[this.command]() === true;
                }

                return false;
            });

        }
        else {
            this.isActive = utils.createObservable(options.isActive, false);
        }

        this.hasSubMenu = ko.computed(() => this.buttons.size() > 0);
    }

    public executeCommand(editor: Editor, e: Event): boolean {
        event.preventDefault(e);

        if (!this.hasSubMenu()) {
            if (this.parent.isSubActive) // if parent is a button
                this.parent.isSubActive(false);

            this.editor.executeCommand(this.command, this.commandArguments);
        }
        else
            this.isSubActive(true);

        return false;
    }

    private createButton(button: any): EditorButton {
        if (button instanceof EditorButton) {
            button.setParent(this);
            return button;
        }
        else {
            return new EditorButton(button, this);
        }
    }
}

export interface EditorSelectOptions extends EditorItemOptions {
    options?: any;
    optionsText?: any;
    optionsValue?: any;
    width?: any;

    command?: any;
    value?: any;
    defaultValue?: any;
}

export class EditorSelect extends EditorItem {
    public template: string = "text!editor-select-template.html";
    public options: any;
    public optionsText: any;
    public optionsValue: any;
    public width: any;

    public command: any;

    public value: KnockoutComputed<any>;

    constructor(options: EditorSelectOptions, parent: IEditorParent) {
        super();
        this.setParent(parent);
        this.loadData(options);

        this.options = options.options || [];
        this.optionsText = options.optionsText;
        this.optionsValue = options.optionsValue;
        this.width = options.width;

        this.command = options.command;

        if (_.isUndefined(options.value) && _.isString(options.command)) {
            if (this.editor && this.editor.formatting[this.command]) {
                options.value = this.editor.formatting[this.command];
            }
        }

        var val = utils.createObservable(options.value, options.defaultValue || "");
        this.value = ko.computed({
            read: val,
            write: function (newValue) {
                if (!this.editor.isEditing())
                    return;

                var _value = val();
                if (_value !== newValue) {
                    if (_value)
                        this.executeCommand(newValue);

                    val(newValue);
                }
            },
            owner: this
        });
    }

    public executeCommand(value: any): void {
        this.editor.executeCommand(this.command, [value || this.value()]);
    }
}

//#endregion

//#region Templates

ui.addTemplate("text!editor-button-template.html",
    "<button data-bind=\"hover: 'hover', css: { disable: !isEnabled(), active: isActive }, enable: isEnabled, click: executeCommand, clickBubble: false\" tabindex=\"-1\">" +
		"<span class=\"icon\" data-bind=\"css: iconCssClass, text: text\"></span>" +
	"</button>" +
	"<!-- ko if: hasSubMenu -->" +
		"<ul data-bind=\"css: { visible: isSubActive }, foreach: buttons\">" +
			"<li data-bind=\"hover : 'hover', attr: { title: description }, click: keepFocus, clickBubble: false\">" +
				"<button class=\"button-inner\" data-bind=\"click: executeCommand, clickBubble: false\">" +
				    "<span class=\"icon\" data-bind=\"css: iconCssClass, text: text\"></span>" +
				"</button>" +
			"</li>" +
		"</ul>" +
	"<!-- /ko -->", engine.defaultInstance);

ui.addTemplate("text!editor-select-template.html", "<select data-bind=\"options: options, optionsText: optionsText, optionsValue: optionsValue, value: value, style: { width: width }\"></select>", engine.defaultInstance);

ui.addTemplate("text!editor-item-template.html", "<li class=\"ui-editor-item\" data-bind=\"hover : 'hover', attr: { title: description }, template: { name: template, data: $data, templateEngine: $root.engine }\"></li>", engine.defaultInstance);

ui.addTemplate("text!editor-template.html",
    "<div class=\"ui-editor\" data-bind=\"style: { top: position.top() + 'px', left: position.left() + 'px' }, click: keepFocus, clickBubble: false\">" +
		"<div class=\"ui-editor-content\" data-bind=\"foreach: groups\">" +
            "<div class=\"ui-editor-group\" data-bind=\"css : { first: isFirst, last: isLast }, foreach: rows\">" +
                "<ul class=\"ui-editor-row\" data-bind=\"template: { name: 'text!editor-item-template.html', foreach: items, templateEngine: $root.engine }\"></ul>" +
            "</div>" +
        "</div>" +
		"<div class=\"ui-editor-move\" title=\"click and hold to move\" data-bind=\"draggable: { container: 'body', top: position.top, left: position.left, dragStart: removeTransitions, dragEnd: restoreTransitions }\"></div>" +
	"</div>", engine.defaultInstance);

//#endregion

//#region Handlers

ko.bindingHandlers.editor = {
    init: function (element: any, valueAccessor: () => any): void {
        var $element = $(element),
            _editor: any = ko.utils.unwrapObservable(valueAccessor()),
            editor: Editor = _editor;

        if (!(_editor instanceof Editor)) {
            editor = new Editor(_editor);
            element.editor = editor;
        }

        initRangy();
        editor.initialize(element);

        $element
            .on("click", (e: JQueryMouseEventObject) => {
                if (!editor.isEnabled())
                    return;

                if (!editor.isEditing()) {
                    createEditorPopup(editor, popup => {
                        var $popup = $(popup),
                            $doc = $(document);

                        editor.startEdit(popup);
                        editor.setPopupPosition(e);
                        $popup.hide().fadeIn(200);

                        $doc.bind("mousedown.editor", (_e: JQueryMouseEventObject) => {
                            var $target = $(event.getTarget(_e));
                            if (!$target.closest($element).length && !$target.closest($popup).length) {
                                removeEditorPopup(editor);

                                $doc.unbind("mousedown.editor");
                            }
                        });
                    });
                }
                else {
                    editor.setPopupPosition(e);
                }

                setSelectionFormatting(editor);
                setEnabledCommands(editor);

                event.preventDefault(e);
                event.stopPropagation(e);
                return false;
            })
            .bind('blur keyup paste', function(e: JQueryEventObject) {
                if (!editor.isEnabled())
                    return;

                if (editor.value() !== $(this).html()) {
                    editor.setHasChanged();
                }

                if (e.type !== "blur") {
                    setSelectionFormatting(editor);
                    setEnabledCommands(editor);
                }
            });
    },
    update: function (element: any, valueAccessor: () => any): void {
        var editor: Editor = element.editor || ko.utils.unwrapObservable(valueAccessor()),
            value = editor.value(), isEnabled = editor.isEnabled();

        if (editor.isUpdatingHtml) {
            return;
        }

        if (value !== element.innerHTML) {
            ko.bindingHandlers.html.update.call(this, element, utils.createAccessor(value));
        }

        if (isEnabled) {
            element.setAttribute("contenteditable", "true");
            useStyleWithCss();
        }
        else {
            element.removeAttribute("contenteditable");
        }
    }
};

//#endregion