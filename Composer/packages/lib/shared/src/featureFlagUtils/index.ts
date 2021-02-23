// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  NEW_CREATION_FLOW: {
    displayName: formatMessage('New Creation Experience'),
    description: formatMessage('Component templates populated from npm feeds'),
    isHidden: false,
    enabled: false,
  },
  FORM_DIALOG: {
    displayName: formatMessage('Form dialogs'),
    description: formatMessage(
      'Automatically generate dialogs that collect information from a user to manage conversations.'
    ),
    documentationLink: 'https://aka.ms/AAailpe',
    isHidden: false,
    enabled: false,
  },
  PACKAGE_MANAGER: {
    displayName: formatMessage('Package manager'),
    description: formatMessage('Discover and use components that can be installed into your bot'),
    isHidden: false,
    enabled: false,
    documentationLink: 'https://aka.ms/composer-package-manager-readme',
  },
});
