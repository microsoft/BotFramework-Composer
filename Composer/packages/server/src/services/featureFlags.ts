// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultFeatureFlags, FeatureFlagMap } from '@bfc/shared';

import { Store } from '../store/store';

export class FeatureFlagService {
  private static currentFeatureFlagMap: FeatureFlagMap = {};

  private static initialize() {
    // Get users feature flag config from data.json and populate if it does not exist
    FeatureFlagService.currentFeatureFlagMap = Store.get('currentFeatureFlags', defaultFeatureFlags);

    const currentFeatureFlagKeys = Object.keys(FeatureFlagService.currentFeatureFlagMap);
    const defaultFeatureFlagKeys = Object.keys(defaultFeatureFlags);

    const keysToAdd = defaultFeatureFlagKeys.filter((key: string) => {
      if (currentFeatureFlagKeys.indexOf(key) === -1) {
        return key;
      }
    });

    const keysToRemove = currentFeatureFlagKeys.filter((key: string) => {
      if (defaultFeatureFlagKeys.indexOf(key) === -1) {
        return key;
      }
    });

    keysToAdd.forEach((key: string) => {
      FeatureFlagService.currentFeatureFlagMap[key] = defaultFeatureFlags[key];
    });

    keysToRemove.forEach((key: string) => {
      delete FeatureFlagService.currentFeatureFlagMap[key];
    });

    if (keysToRemove?.length > 0 || keysToAdd?.length > 0) {
      Store.set('currentFeatureFlags', FeatureFlagService.currentFeatureFlagMap);
    }
  }

  public static getFeatureFlags(): FeatureFlagMap {
    FeatureFlagService.initialize();
    return FeatureFlagService.currentFeatureFlagMap;
  }

  public static updateFeatureFlag(newFeatureFlags: FeatureFlagMap) {
    Store.set('currentFeatureFlags', newFeatureFlags);
  }
}
