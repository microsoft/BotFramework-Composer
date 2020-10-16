// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultFeatureFlags, FeatureFlag, FeatureFlagNames } from '@bfc/shared';

import { Store } from '../store/store';

export class FeatureFlagService {
  private static currentFeatureFlags: FeatureFlag[] = [];
  // private static featureFlagMap: {
  //   [key: string]: FeatureFlag;
  // };

  private static initialize() {
    if (!FeatureFlagService.currentFeatureFlags || FeatureFlagService.currentFeatureFlags.length === 0) {
      // Get users feature flag config from data.json and populate if it does not exist
      FeatureFlagService.currentFeatureFlags = Store.get('currentFeatureFlags', defaultFeatureFlags);
      // Check to see if any new feature flags have been added and append new feature flags to store

      // TODO: DEBUG AND IMPROVE
      while (FeatureFlagService.currentFeatureFlags.length < defaultFeatureFlags.length) {
        for (let i = 0; i < defaultFeatureFlags.length; i++) {
          let addFeatureFlag = true;
          for (let t = 0; t < FeatureFlagService.currentFeatureFlags.length; t++) {
            if (defaultFeatureFlags[i].name === FeatureFlagService.currentFeatureFlags[t].name) {
              addFeatureFlag = false;
              break;
            }
          }
          if (addFeatureFlag) {
            FeatureFlagService.currentFeatureFlags.push(defaultFeatureFlags[i]);
            if (FeatureFlagService.currentFeatureFlags.length === defaultFeatureFlags.length) {
              break;
            }
          }
        }
        Store.set('currentFeatureFlags', FeatureFlagService.currentFeatureFlags);
      }
    }
  }

  public static getFeatureFlags(): FeatureFlag[] {
    FeatureFlagService.initialize();
    return FeatureFlagService.currentFeatureFlags;
  }

  public static updateFeatureFlag(newFeatureFlags: FeatureFlag[]) {
    FeatureFlagService.initialize();
    // TODO: change feature flag
    Store.set('currentFeatureFlags', newFeatureFlags);
  }
}
