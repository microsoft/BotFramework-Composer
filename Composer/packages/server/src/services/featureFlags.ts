// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultFeatureFlags, FeatureFlagMap, FeatureFlagKey } from '@bfc/shared';

import { Store } from '../store/store';

const storeKey = 'featureFlags';

export class FeatureFlagService {
  private static currentFeatureFlagMap: FeatureFlagMap = {} as FeatureFlagMap;

  private static initialize() {
    // Get users feature flag config from data.json and populate if it does not exist
    FeatureFlagService.currentFeatureFlagMap = Store.get(storeKey, defaultFeatureFlags);
    FeatureFlagService.updateFeatureFlags();
  }

  private static updateFeatureFlags = () => {
    const currentFeatureFlagKeys = Object.keys(FeatureFlagService.currentFeatureFlagMap);
    const defaultFeatureFlagKeys = Object.keys(defaultFeatureFlags);

    const keysToAdd = defaultFeatureFlagKeys.filter((key: string) => {
      if (!currentFeatureFlagKeys.includes(key)) {
        return key;
      }
    });

    const keysToRemove = currentFeatureFlagKeys.filter((key: string) => {
      if (!defaultFeatureFlagKeys.includes(key)) {
        return key;
      }
    });

    keysToAdd.forEach((key: string) => {
      FeatureFlagService.currentFeatureFlagMap[key] = defaultFeatureFlags[key];
    });

    keysToRemove.forEach((key: string) => {
      delete FeatureFlagService.currentFeatureFlagMap[key];
    });

    const hiddenFeatureFlagUpdated = FeatureFlagService.updateHiddenFeatureFlags();

    if (keysToRemove?.length > 0 || keysToAdd?.length > 0 || hiddenFeatureFlagUpdated) {
      Store.set(storeKey, FeatureFlagService.currentFeatureFlagMap);
    }
  };

  private static updateHiddenFeatureFlags = (): boolean => {
    const hiddenFeatureFlagKeys = Object.keys(FeatureFlagService.currentFeatureFlagMap).filter((key: string) => {
      if (FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].isHidden) {
        return key;
      }
    });

    let result = false;
    hiddenFeatureFlagKeys.forEach((key: string) => {
      if (process.env[key] && process.env[key] !== FeatureFlagService.currentFeatureFlagMap[key]) {
        FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].enabled =
          process.env[key]?.toLowerCase() === 'true';
        result = true;
      }
    });
    return result;
  };

  public static getFeatureFlags(): FeatureFlagMap {
    FeatureFlagService.initialize();
    return FeatureFlagService.currentFeatureFlagMap;
  }

  public static updateFeatureFlag(newFeatureFlags: FeatureFlagMap) {
    Store.set(storeKey, newFeatureFlags);
  }
}
