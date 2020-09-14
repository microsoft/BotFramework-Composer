"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.QnAActionsField = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var extension_1 = require("@bfc/extension");
var format_message_1 = tslib_1.__importDefault(require("format-message"));
var Link_1 = require("../Link");
exports.QnAActionsField = function StringField() {
    var _a = extension_1.useShellApi(), currentDialog = _a.currentDialog, projectId = _a.projectId;
    var qnaUrl = "/bot/" + projectId + "/knowledge-base/" + currentDialog.id;
    var content = format_message_1.default('Go to QnA all-up view page.');
    return react_1.default.createElement(Link_1.Link, { href: qnaUrl }, content);
};
//# sourceMappingURL=QnAActionsField.js.map