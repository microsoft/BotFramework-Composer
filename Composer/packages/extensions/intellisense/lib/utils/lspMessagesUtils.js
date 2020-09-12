"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionRequestMessage = exports.getDocumentChangedMessage = exports.getConfigurationChangedMessage = exports.getTextDocumentOpenedMessage = exports.getInitializeMessage = void 0;
exports.getInitializeMessage = function (scopes, projectId) {
    var params = {
        rootUri: null,
        capabilities: {},
        workspaceFolders: null,
        processId: null,
        initializationOptions: { scopes: scopes, projectId: projectId },
    };
    return {
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: params,
    };
};
exports.getTextDocumentOpenedMessage = function (uri, languageId, version, text) {
    var params = {
        textDocument: {
            uri: uri,
            languageId: languageId,
            version: version,
            text: text,
        },
    };
    return {
        jsonrpc: '2.0',
        method: 'textDocument/didOpen',
        params: params,
    };
};
exports.getConfigurationChangedMessage = function (scopes, projectId) {
    var params = {
        settings: {
            scopes: scopes,
            projectId: projectId,
        },
    };
    return {
        jsonrpc: '2.0',
        method: 'workspace/didChangeConfiguration',
        params: params,
    };
};
exports.getDocumentChangedMessage = function (text, uri, version) {
    var params = {
        contentChanges: [{ text: text }],
        textDocument: {
            uri: uri,
            version: version,
        },
    };
    return {
        jsonrpc: '2.0',
        method: 'textDocument/didChange',
        params: params,
    };
};
exports.getCompletionRequestMessage = function (id, uri, position) {
    var params = {
        position: position,
        textDocument: {
            uri: uri,
        },
    };
    return {
        id: id,
        jsonrpc: '2.0',
        method: 'textDocument/completion',
        params: params,
    };
};
//# sourceMappingURL=lspMessagesUtils.js.map