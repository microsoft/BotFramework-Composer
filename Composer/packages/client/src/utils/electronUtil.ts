// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PublishTarget, PublishProfile } from '@bfc/shared';

/**
 * Returns true if the client is embedded in the Composer Electron environment.
 */
export function isElectron(): boolean {
  return !!window.__IS_ELECTRON__;
}

/**
 *
 * @param profile payload from bf's create protocol
 */
export function getPublishProfileFromPayload(profile: PublishProfile, source: string): PublishTarget | undefined {
  switch (source) {
    case 'abs':
      const appId = profile.appId;
      delete profile.appId;
      return {
        name: `${source}-${profile.botName}`,
        type: 'azurePublish',
        configuration: JSON.stringify({
          hostname: profile.tag?.webapp || '',
          runtimeIdentifier: 'win-x64',
          settings: {
            MicrosoftAppId: appId,
          },
          ...profile,
        }),
      };
  }
}

export function getAliasFromPayload(source: string, payload: string): string | undefined {
  switch (source) {
    case 'abs':
      if (payload) {
        const profile: PublishProfile = JSON.parse(payload);
        const alias = `${source}-${profile.botName}-${profile.appId}`;
        return alias;
      }
  }
}
