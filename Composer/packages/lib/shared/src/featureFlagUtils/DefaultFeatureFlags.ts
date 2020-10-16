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
  'Show Tutorial': {
    description: 'Show tutorial section in the home page',
    isHidden: false,
    value: true,
  },
  'Show Qna in creation': {
    description: 'Show QNA in creation for da people of the world',
    isHidden: false,
    value: true,
  },
  'Hide Form Dialog': {
    description: 'Show QNA in creation for da people of the world',
    isHidden: false,
    value: true,
  },
  'Hide Web Chat': {
    description: 'Webchat is snazzy, why hide ',
    isHidden: false,
    value: true,
  },
};

export type FeatureFlagNames =
  | 'Show Qna in creation'
  | 'Show Tutorial'
  | 'VA Creation'
  | 'Hide Form Dialog'
  | 'Hide Web Chat Editor';

export const getFeatureFlagValue = (name: FeatureFlagNames, featureFlagMap: FeatureFlagMap): boolean => {
  return featureFlagMap[name].value;
};
