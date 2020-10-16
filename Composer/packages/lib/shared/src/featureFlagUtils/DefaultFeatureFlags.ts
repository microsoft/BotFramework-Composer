// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type FeatureFlag = {
  description: string;
  isHidden: boolean;
  value: boolean;
};

export type FeatureFlagMap = {
  [key: string]: FeatureFlag;
};

export const defaultFeatureFlags: FeatureFlagMap = {
  'VA Creation': {
    description: 'VA template made available in new bot flow',
    isHidden: false,
    value: true,
  },
};

export const getFeatureFlagValue = (name: string, featureFlagMap: FeatureFlagMap): boolean => {
  return featureFlagMap[name].value;
};
