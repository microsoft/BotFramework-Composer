// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PublishTarget } from '@bfc/shared';

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
export function getPublishProfileFromPayload(profile: Profile, source: string): PublishTarget | undefined {
  switch (source) {
    case 'abs': {
      const appId = profile.appId;
      // parse subscriptionId ... from profile
      const temp = { ...profile };
      const subs = profile.resourceId.match(/subscriptions\/([\w-]*)\//);
      const groups = profile.resourceId.match(/resourceGroups\/([^/]*)/);
      const names = profile.resourceId.match(/botServices\/([^/]*)/);
      temp.subscriptionId = (subs && subs.length > 0 && subs[1]) || '';
      temp.resourceGroup = (groups && groups.length > 0 && groups[1]) || '';
      temp.botName = (names && names.length > 0 && names[1]) || '';
      delete temp.appId;

      console.log(temp);
      return {
        name: `${source}-${profile.botName}`,
        type: 'azurePublish',
        configuration: JSON.stringify({
          hostname: '',
          runtimeIdentifier: 'win-x64',
          settings: {
            MicrosoftAppId: appId,
          },
          ...temp,
        }),
      };
    }
  }
}

export function getAliasFromPayload(source: string, payload: string): string | undefined {
  switch (source) {
    case 'abs':
      if (payload) {
        const profile: ABSProfile = JSON.parse(payload);
        const alias = `${source}-${profile.botName}-${profile.appId}`;
        return alias;
      }
  }
}
