// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  FORM_DIALOG: {
    displayName: formatMessage('Form dialogs'),
    description: formatMessage(
      'Automatically generate dialogs that collect information from a user to manage conversations.'
    ),
    documentationLink: 'https://aka.ms/AAailpe',
    isHidden: false,
    enabled: false,
  },
  ADVANCED_TEMPLATE_OPTIONS: {
    displayName: formatMessage('Advanced template options'),
    description: formatMessage(
      'Enables creating bots from local templates as well as creating bots from older versions of published templates'
    ),
    documentationLink: '',
    isHidden: true,
    enabled: false,
  },
});
