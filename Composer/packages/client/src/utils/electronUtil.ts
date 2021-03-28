// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PublishTarget } from '@bfc/shared';

// import { armScopes } from '../constants';

import httpClient from './httpUtil';
// import { AuthClient } from './authClient';
/**
 * Returns true if the client is embedded in the Composer Electron environment.
 */
export function isElectron(): boolean {
  return !!window.__IS_ELECTRON__;
}

type ABSProfile = {
  resourceId: string;
  botName?: string;
  appId?: string;
  appPasswordHint: string;
  subscriptionId?: string;
  resourceGroup?: string;
  armEndpoint?: string;
};
export type Profile = ABSProfile; // can include PVAProfile or other type of profile by |
/**
 *
 * @param profile payload from bf's create protocol
 */
export async function getPublishProfileFromPayload(
  profile: Profile,
  source: string
): Promise<PublishTarget | undefined> {
  try {
    const result = await httpClient.post(`/import/${source}/generateProfile`, profile);
    return result.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getAliasFromPayload(source: string, payload: string): Promise<string | undefined> {
  try {
    const result = await httpClient.post(`/import/${source}/getAlias`, JSON.parse(payload));
    return result.data.alias;
  } catch (error) {
    console.log(error);
  }
}
