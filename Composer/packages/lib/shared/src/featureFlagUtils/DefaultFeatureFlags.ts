// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type FeatureFlag = {
  // Name to be displayed for this features toggle UI in app settings page
  displayName: string;
  // Description to be displayed for this features toggle UI in app settings page
  description: string;
  // Indicates whether or not the feature flag toggle will be visible to the user through the settings page UI
  // Hidden feature flags are intended for features not ready for public preview
  isHidden: boolean;
  enabled: boolean;
};

export type FeatureFlagKey = 'VA_CREATION' | 'SHOW_FORM_DIALOG';

export type FeatureFlagMap = Record<FeatureFlagKey, FeatureFlag>;

export const defaultFeatureFlags: FeatureFlagMap = {
  VA_CREATION: {
    displayName: 'VA Creation',
    description: 'VA template made available in new bot flow.',
    isHidden: false,
    enabled: false,
  },
  SHOW_FORM_DIALOG: {
    displayName: 'Show Form Dialog',
    description: 'Show form dialog editor in the canvas',
    isHidden: true,
    enabled: false,
  },
};

export const getFeatureFlagValue = (name: string, featureFlagMap: FeatureFlagMap): boolean => {
  if (!featureFlagMap[name]) {
    return false;
  }
  return featureFlagMap[name].enabled;
};
