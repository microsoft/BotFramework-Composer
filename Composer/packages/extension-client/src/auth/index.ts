// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';
import { OAuthOptions } from './types';

/** Logs the user into Azure for a given client ID with the provided scopes. Returns an ID token. */
export function login(options: OAuthOptions): Promise<string> {
  return window[ComposerGlobalName].login(options);
}

/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export function getAccessToken(options: OAuthOptions): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(options);
}

/** Return an access token held in the localstorage.
 * TODO: deprecate this when we have azure login working
 */
export function getAccessTokensFromStorage(): { access_token: string; graph_token: string } {
  return window[ComposerGlobalName].getAccessTokensFromStorage();
}
