// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthParameters } from '@botframework-composer/types';

import { ComposerGlobalName } from '../common/constants';

/**
 * log out current user
 */
export function logOut(): Promise<void> {
  return window[ComposerGlobalName].logOut();
}

/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export function getAccessToken(params: AuthParameters): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(params);
}
