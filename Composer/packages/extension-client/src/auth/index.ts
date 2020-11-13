// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import { ComposerGlobalName } from '../common/constants';

/** Logs the user into Azure for a given client ID with the provided scopes. Returns an ID token. */
export function login(params: AuthParameters): Promise<string> {
  return window[ComposerGlobalName].login(params);
}

/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export function getAccessToken(params: AuthParameters): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(params);
}

/** Return an access token held in the localstorage.
 * TODO: deprecate this when we have azure login working
 */
export function getAccessTokensFromStorage(): { access_token: string; graph_token: string } {
  return window[ComposerGlobalName].getAccessTokensFromStorage();
}
/**
 * Return the current user info, like name, email and so on.
 */
export function getCurrentUser() {
  return window[ComposerGlobalName].getCurrentUser();
}
