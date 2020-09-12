"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionList = void 0;
var tslib_1 = require("tslib");
/** @jsx jsx */
var react_1 = tslib_1.__importDefault(require("react"));
var core_1 = require("@emotion/core");
var CompletionElement_1 = require("./CompletionElement");
var styles = {
    completionList: core_1.css(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n    position: absolute;\n    top: 32;\n    left: 0;\n    max-height: 300px;\n    width: 100%;\n    background-color: white;\n    overflow-y: auto;\n    overflow-x: hidden;\n    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n    z-index: 2000;\n  "], ["\n    position: absolute;\n    top: 32;\n    left: 0;\n    max-height: 300px;\n    width: 100%;\n    background-color: white;\n    overflow-y: auto;\n    overflow-x: hidden;\n    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n    z-index: 2000;\n  "]))),
};
exports.CompletionList = react_1.default.forwardRef(function (props, ref) {
    var completionItems = props.completionItems, selectedItem = props.selectedItem, onClickCompletionItem = props.onClickCompletionItem;
    return (core_1.jsx("div", { ref: ref, css: styles.completionList }, completionItems.map(function (completionItem, index) { return (core_1.jsx(CompletionElement_1.CompletionElement, { key: index, completionItem: completionItem, isSelected: selectedItem === index, onClickCompletionItem: function () { return onClickCompletionItem(index); } })); })));
});
var templateObject_1;
//# sourceMappingURL=CompletionList.js.map