// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getDefaultFeatureFlags } from '@bfc/shared';
import { FeatureFlagMap, FeatureFlagKey } from '@botframework-composer/types';

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

    // apply defaults to the loaded feature flags
    Object.keys(FeatureFlagService.currentFeatureFlagMap).forEach((key) => {
      FeatureFlagService.currentFeatureFlagMap[key] = {
        ...FeatureFlagService.defaultFeatureFlags[key],
        ...FeatureFlagService.currentFeatureFlagMap[key],
        displayName: FeatureFlagService.defaultFeatureFlags[key]?.displayName,
        description: FeatureFlagService.defaultFeatureFlags[key]?.description,
        documentationLink: FeatureFlagService.defaultFeatureFlags[key]?.documentationLink,
      };
    });

    let saveNeeded = false;

    // check if a hidden feature flag is no longer hidden
    defaultFeatureFlagKeys.forEach((key: string) => {
      const currentFlag = FeatureFlagService.currentFeatureFlagMap[key];
      const defaultFlag = FeatureFlagService.defaultFeatureFlags[key];
      if (currentFlag && defaultFlag && currentFlag.isHidden !== defaultFlag.isHidden) {
        FeatureFlagService.currentFeatureFlagMap[key].isHidden = FeatureFlagService.defaultFeatureFlags[key].isHidden;
        saveNeeded = true;
      }
    });

    // add any new keys defined in the defaults that aren't in current
    defaultFeatureFlagKeys
      .filter((key: string) => !currentFeatureFlagKeys.includes(key))
      .forEach((key: string) => {
        FeatureFlagService.currentFeatureFlagMap[key] = FeatureFlagService.defaultFeatureFlags[key];
        saveNeeded = true;
      });

    // remove any keys no longer in default that are in current
    currentFeatureFlagKeys
      .filter((key: string) => !defaultFeatureFlagKeys.includes(key))
      .forEach((key: string) => {
        delete FeatureFlagService.currentFeatureFlagMap[key];
        saveNeeded = true;
      });

    // set any hidden feature flags from the process
    // process should override value for hidden features flags
    Object.keys(FeatureFlagService.currentFeatureFlagMap)
      .filter((key) => FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].isHidden)
      .forEach((key) => {
        const enabled = FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].enabled;
        const processEnvEnabled = key in process.env;

        if (enabled !== processEnvEnabled) {
          FeatureFlagService.currentFeatureFlagMap[key as FeatureFlagKey].enabled = processEnvEnabled;
          saveNeeded = true;
        }
      });

    if (saveNeeded) {
      FeatureFlagService.saveFeatureFlags();
    }
  };

  private static saveFeatureFlags() {
    const saveFeatureFlagMap: FeatureFlagMap = {} as FeatureFlagMap;

    // only save user data to avoid replacing values from defaults like displayName
    Object.keys(FeatureFlagService.currentFeatureFlagMap).forEach((key) => {
      saveFeatureFlagMap[key] = {
        enabled: FeatureFlagService.currentFeatureFlagMap[key].enabled,
        isHidden: FeatureFlagService.currentFeatureFlagMap[key].isHidden,
      };
    });
    Store.set(storeKey, saveFeatureFlagMap);
  }

  public static getFeatureFlags(): FeatureFlagMap {
    FeatureFlagService.initialize();
    return FeatureFlagService.currentFeatureFlagMap;
  }

  public static updateFeatureFlag(newFeatureFlags: FeatureFlagMap) {
    FeatureFlagService.currentFeatureFlagMap = newFeatureFlags;
    FeatureFlagService.saveFeatureFlags();
  }

  public static getFeatureFlagValue(featureFlagKey: FeatureFlagKey): boolean {
    if (FeatureFlagService.currentFeatureFlagMap && FeatureFlagService.currentFeatureFlagMap[featureFlagKey]) {
      return FeatureFlagService.currentFeatureFlagMap[featureFlagKey].enabled;
    }
    return false;
  }
}
