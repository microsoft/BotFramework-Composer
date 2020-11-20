// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { FeatureFlagMap } from '@botframework-composer/types';

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
  ORCHESTRATOR: {
    displayName: formatMessage('Orchestrator'),
    description: formatMessage(
      'Use as intent-only recognizer, typically for routing to skills or subsequent LUIS or QnAMaker processing or when entity extraction is not needed.'
    ),
    isHidden: false,
    enabled: false,
  },
});
