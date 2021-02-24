// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

export const getDefaultFeatureFlags = (): FeatureFlagMap => ({
  NEW_CREATION_FLOW: {
    displayName: formatMessage('New Creation Experience'),
    description: formatMessage('Preview the new adaptive runtime and component system'),
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
  ORCHESTRATOR: {
    displayName: formatMessage('Orchestrator'),
    description: formatMessage('Recognize an intent, and take action or route to a skill, LUIS app, or QnAMaker KB'),
    documentationLink: 'https://aka.ms/bf-orchestrator',
    isHidden: false,
    enabled: false,
  },
});
