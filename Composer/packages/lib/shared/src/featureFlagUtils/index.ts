// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

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

export type FeatureFlagKey = 'VA_CREATION' | 'FORM_DIALOG' | 'REMOTE_TEMPLATE_CREATION_EXPERIENCE';

export type FeatureFlagMap = Record<FeatureFlagKey, FeatureFlag>;

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  VA_CREATION: {
    displayName: formatMessage('VA Creation'),
    description: formatMessage('VA template made available in new bot flow.'),
    isHidden: true,
    enabled: false,
  },
  FORM_DIALOG: {
    displayName: formatMessage('Show Form Dialog'),
    description: formatMessage('Show form dialog editor in the canvas'),
    isHidden: false,
    enabled: false,
  },
  REMOTE_TEMPLATE_CREATION_EXPERIENCE: {
    displayName: formatMessage('Remote templates'),
    description: formatMessage(
      'If turned on then externally stored templates will be selectable in the new bot flow template list'
    ),
    isHidden: true,
    enabled: false,
  },
});
