// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type FeatureFlag = {
  name: FeatureFlagNames;
  description: string;
  isHidden: boolean;
  value: boolean;
};

export const defaultFeatureFlags: FeatureFlag[] = [
  {
    name: 'VA Creation',
    description: 'VA template made available in new bot flow',
    isHidden: false,
    value: false,
  },
  {
    name: 'Show Tutorial',
    description: 'Show tutorial section in the home page',
    isHidden: false,
    value: false,
  },
  {
    name: 'Show Qna in creation',
    description: 'Show QNA in creation for da people of the world',
    isHidden: false,
    value: false,
  },
  {
    name: 'Hide Form Dialog',
    description: 'Show QNA in creation for da people of the world',
    isHidden: false,
    value: false,
  },
  {
    name: 'Hide Web Chat Editor',
    description: 'Show QNA in creation for da people of the world',
    isHidden: false,
    value: false,
  },
];

export type FeatureFlagNames =
  | 'Show Qna in creation'
  | 'Show Tutorial'
  | 'VA Creation'
  | 'Hide Form Dialog'
  | 'Hide Web Chat Editor';

export const getFeatureFlagValue = (name: FeatureFlagNames, featureFlagArray: FeatureFlag[]): boolean => {
  let result = false;
  featureFlagArray.forEach((featureFlag: FeatureFlag) => {
    if (featureFlag.name == name) {
      result = featureFlag.value;
    }
  });
  return result;
};
