// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  NEW_CREATION_FLOW: {
    displayName: formatMessage('The Component Model'),
    description: formatMessage(
      'Enable the Component Model including the new creation experience, the Adaptive Runtime, and Package Manager.'
    ),
    isHidden: false,
    enabled: false,
    documentationLink: 'https://aka.ms/ComponentTemplateDocumentation',
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
});
