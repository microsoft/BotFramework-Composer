// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

export const SensitiveProperties = ['MicrosoftAppPassword', 'luis.authoringKey', 'luis.endpointKey'];
export const FieldNames = {
  Events: 'triggers',
  Actions: 'actions',
  ElseActions: 'elseActions',
  Condition: 'condition',
  DefaultCase: 'default',
  Cases: 'cases',
};

export const thisPC = formatMessage('This PC');
