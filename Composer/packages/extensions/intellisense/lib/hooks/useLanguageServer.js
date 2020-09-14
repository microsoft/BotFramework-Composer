"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLanguageServer = void 0;
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var websocket_1 = require("websocket");
var lspMessagesUtils_1 = require("../utils/lspMessagesUtils");
var LANGUAGE_NAME = 'intellisense';
/**
 * A hook that connects to a LSP server. It takes information about a textField (value, position) and returns completion results
 * @param url url of the LSP server
 * @param scopes scopes are used to filter the type of completion results to show (variables, expressions, etc..)
 * @param documentUri a unique identifier for the textField
 * @param textFieldValue current value of textField
 * @param cursorPosition position of textField cursor
 */
exports.useLanguageServer = function (url, scopes, documentUri, textFieldValue, cursorPosition, projectId) {
    var ws = react_1.default.useRef();
    var latestMessageId = react_1.default.useRef(0);
    var latestDocumentVersion = react_1.default.useRef(0);
    var _a = react_1.default.useState([]), completionItems = _a[0], setCompletionItems = _a[1];
    // Initialize websocket connection for a specific url
    react_1.default.useEffect(function () {
        ws.current = new websocket_1.w3cwebsocket(url);
        ws.current.onopen = function () {
            ws.current.send(JSON.stringify(lspMessagesUtils_1.getInitializeMessage(scopes, projectId)));
            ws.current.send(JSON.stringify(lspMessagesUtils_1.getTextDocumentOpenedMessage(documentUri, LANGUAGE_NAME, latestDocumentVersion.current, textFieldValue)));
        };
        ws.current.onmessage = function (messageText) {
            handleMessage(messageText);
        };
    }, [url]);
    // If scopes change, update backend with info
    react_1.default.useEffect(function () {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(lspMessagesUtils_1.getConfigurationChangedMessage(scopes, projectId)));
        }
    }, [scopes, projectId]);
    // When textField value changes, update backend memory and get latest completion results
    react_1.default.useEffect(function () {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            updateBackendMemory(textFieldValue);
        }
    }, [textFieldValue]);
    // Get completion results when selection changes
    react_1.default.useEffect(function () {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            getCompletionItems();
        }
    }, [cursorPosition]);
    // Handles messages coming back from the LSP server
    var handleMessage = function (messageText) {
        var _a, _b;
        var message = JSON.parse(messageText.data);
        var id = message.id;
        // Only completion messages have an id
        // In the future, if other types of messages use id, then we would have to keep a table of {id: typeOfMessage} to know how to handle each message based on their id
        if (id) {
            if ((_a = message.result) === null || _a === void 0 ? void 0 : _a.items) {
                setCompletionItems((_b = message.result) === null || _b === void 0 ? void 0 : _b.items);
            }
            else {
                setCompletionItems([]);
            }
        }
    };
    // Every time the textField value changes, we need to tell the backend about it
    var updateBackendMemory = function (newValue) {
        latestDocumentVersion.current += 1;
        if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(lspMessagesUtils_1.getDocumentChangedMessage(newValue, documentUri, latestDocumentVersion.current)));
        }
    };
    // Requests completion results
    var getCompletionItems = function () {
        latestMessageId.current += 1;
        ws.current.send(JSON.stringify(lspMessagesUtils_1.getCompletionRequestMessage(latestMessageId.current, documentUri, {
            line: 0,
            character: cursorPosition,
        })));
    };
    return completionItems;
};
//# sourceMappingURL=useLanguageServer.js.map