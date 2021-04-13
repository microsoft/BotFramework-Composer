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
});
