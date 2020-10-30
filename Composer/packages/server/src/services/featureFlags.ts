// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultFeatureFlags, FeatureFlagMap, FeatureFlagKey } from '@bfc/shared';

import { Store } from '../store/store';

const storeKey = 'featureFlags';

export class FeatureFlagService {
  private static currentFeatureFlagMap: FeatureFlagMap = {} as FeatureFlagMap;
  private static defaultFeatureFlags: FeatureFlagMap = {} as FeatureFlagMap;

  private static initialize() {
    // Get users feature flag config from data.json and populate if it does not exist
    FeatureFlagService.defaultFeatureFlags = getDefaultFeatureFlags();
    FeatureFlagService.currentFeatureFlagMap = Store.get(storeKey, FeatureFlagService.defaultFeatureFlags);
    FeatureFlagService.syncFeatureFlags();
  }

  private static syncFeatureFlags = () => {
    const defaultFeatureFlagKeys = Object.keys(FeatureFlagService.defaultFeatureFlags);

    defaultFeatureFlagKeys.forEach((key: string) => {
      if (FeatureFlagService.currentFeatureFlagMap[key]) {
        // Grab latest changes from default but preserve users enabled value for any given feature flag
        FeatureFlagService.currentFeatureFlagMap[key] = {
          ...FeatureFlagService.defaultFeatureFlags[key],
          enabled: FeatureFlagService.currentFeatureFlagMap[key].enabled,
        };
      } else {
        // Add new feature flags from default to current if current does not have it
        FeatureFlagService.currentFeatureFlagMap[key] = FeatureFlagService.defaultFeatureFlags[key];
      }
    });
    const currentFeatureFlagKeys = Object.keys(FeatureFlagService.currentFeatureFlagMap);

    // If default has removed a feature flag then remove from current
    currentFeatureFlagKeys.forEach((key: string) => {
      if (defaultFeatureFlagKeys.indexOf(key) === -1) {
        delete FeatureFlagService.currentFeatureFlagMap[key];
      }
    });

    // Store updates
    Store.set(storeKey, FeatureFlagService.currentFeatureFlagMap);
  };

  public static getFeatureFlags(): FeatureFlagMap {
    FeatureFlagService.initialize();
    return FeatureFlagService.currentFeatureFlagMap;
  }

  public static updateFeatureFlag(newFeatureFlags: FeatureFlagMap) {
    FeatureFlagService.currentFeatureFlagMap = newFeatureFlags;
    Store.set(storeKey, newFeatureFlags);
  }

  public static getFeatureFlagValue(featureFlagKey: FeatureFlagKey): boolean {
    if (FeatureFlagService.currentFeatureFlagMap && FeatureFlagService.currentFeatureFlagMap[featureFlagKey]) {
      return FeatureFlagService.currentFeatureFlagMap[featureFlagKey].enabled;
    }
    return false;
  }
}
