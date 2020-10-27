// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ComposerGlobalName } from '../common/constants';
import { OAuthOptions } from './types';

/** Requests an access token from Azure for a given client ID with the provided scopes.
 *  Returns an access token that can be used to call APIs on behalf of the user.
 *
 */
export function getAccessToken(options: OAuthOptions): Promise<string> {
  return window[ComposerGlobalName].getAccessToken(options);
}
