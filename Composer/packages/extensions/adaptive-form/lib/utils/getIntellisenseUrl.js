"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntellisenseUrl = void 0;
exports.getIntellisenseUrl = function () {
    var intellisenseWebSocketUrl = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
    intellisenseWebSocketUrl = intellisenseWebSocketUrl + "/intellisense-language-server";
    return intellisenseWebSocketUrl;
};
//# sourceMappingURL=getIntellisenseUrl.js.map