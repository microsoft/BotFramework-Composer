// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type FeatureFlag = {
  description: string;
  isHidden: boolean;
  value: boolean;
};

export type FeatureFlagMap = {
  [key in FeatureFlagNames]: FeatureFlag;
};

export const defaultFeatureFlags: FeatureFlagMap = {
  'VA Creation': {
    description: 'VA template made available in new bot flow.',
    isHidden: false,
    value: true,
  },
  'Show Tutorial': {
    description: 'Show tutorial on home page.',
    isHidden: false,
    value: true,
  },
  'Show Form Dialog': {
    description: 'Show tutorial on home page.',
    isHidden: true,
    value: true,
  },
};

export type FeatureFlagNames = 'VA Creation' | 'Show Tutorial' | 'Show Form Dialog';

export const getFeatureFlagValue = (name: string, featureFlagMap: FeatureFlagMap): boolean => {
  if (!featureFlagMap[name]) {
    console.log(`feature flag does not exist for: ${name}`);
    return false;
  }
  return featureFlagMap[name].value;
};
