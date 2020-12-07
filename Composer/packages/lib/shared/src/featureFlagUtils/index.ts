// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  FORM_DIALOG: {
    displayName: formatMessage('Show Form Dialog'),
    description: formatMessage(
      'Automatically generate dialogs that collect information from a user to manage conversations.'
    ),
    documentationLink: 'https://aka.ms/AAailpe',
    isHidden: false,
    enabled: false,
  },
  REMOTE_TEMPLATE_CREATION_EXPERIENCE: {
    displayName: formatMessage('Conversational Core Template'),
    description: formatMessage('Enable the new conversational core template built on the component model'),
    documentationLink: 'https://aka.ms/AAabzf9',
    isHidden: false,
    enabled: false,
  },
  ORCHESTRATOR: {
    displayName: formatMessage('Orchestrator'),
    description: formatMessage(
      'Use as intent-only recognizer, typically for routing to skills or subsequent LUIS or QnAMaker processing or when entity extraction is not needed.'
    ),
    isHidden: false,
    enabled: false,
  },
});
