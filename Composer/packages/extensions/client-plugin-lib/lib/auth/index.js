"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../common/constants");
/** Logs the user into Azure for a given client ID with the provided scopes. Returns an ID token. */
function login(options) {
    return window[constants_1.ComposerGlobalName].login(options);
}
exports.login = login;
/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
function getAccessToken(options) {
    return window[constants_1.ComposerGlobalName].getAccessToken(options);
}
exports.getAccessToken = getAccessToken;
//# sourceMappingURL=index.js.map