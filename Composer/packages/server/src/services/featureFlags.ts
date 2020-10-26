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
    FeatureFlagService.updateFeatureFlags();
  }

  private static updateFeatureFlags = () => {
    const currentFeatureFlagKeys = Object.keys(FeatureFlagService.currentFeatureFlagMap);
    const defaultFeatureFlagKeys = Object.keys(FeatureFlagService.defaultFeatureFlags);
    const keysToAdd: string[] = [];
    const keysToUpdateHidden: string[] = [];

    defaultFeatureFlagKeys.forEach((key: string) => {
      if (!currentFeatureFlagKeys.includes(key)) {
        keysToAdd.push(key);
      } else if (
        currentFeatureFlagKeys.includes(key) &&
        FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].isHidden !==
          FeatureFlagService.defaultFeatureFlags[key as FeatureFlagKey].isHidden
      ) {
        keysToUpdateHidden.push(key);
      }
    });

    const keysToRemove = currentFeatureFlagKeys.filter((key: string) => {
      if (!defaultFeatureFlagKeys.includes(key)) {
        return key;
      }
    });

    keysToAdd.forEach((key: string) => {
      FeatureFlagService.currentFeatureFlagMap[key] = FeatureFlagService.defaultFeatureFlags[key];
    });

    keysToRemove.forEach((key: string) => {
      delete FeatureFlagService.currentFeatureFlagMap[key];
    });

    keysToUpdateHidden.forEach((key: string) => {
      FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].isHidden =
        FeatureFlagService.defaultFeatureFlags[key as FeatureFlagKey].isHidden;
    });

    const hiddenFeatureFlagUpdated = FeatureFlagService.updateHiddenFeatureFlags();

    if (
      keysToRemove?.length > 0 ||
      keysToAdd?.length > 0 ||
      keysToUpdateHidden?.length > 0 ||
      hiddenFeatureFlagUpdated
    ) {
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
