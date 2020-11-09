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
