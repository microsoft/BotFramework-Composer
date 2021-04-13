// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type FeatureFlag = {
  // Name to be displayed for this features toggle UI in app settings page
  displayName: string;
  // Description to be displayed for this features toggle UI in app settings page
  description: string;

  documentationLink?: string;
  // Indicates whether or not the feature flag toggle will be visible to the user through the settings page UI
  // Hidden feature flags are intended for features not ready for public preview
  isHidden: boolean;
  enabled: boolean;
};

export type FeatureFlagKey = 'FORM_DIALOG';

export type FeatureFlagMap = Record<FeatureFlagKey, FeatureFlag>;
