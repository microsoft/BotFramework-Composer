// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const SensitiveProperties = ['MicrosoftAppPassword', 'luis.authoringKey', 'luis.endpointKey'];
export const FieldNames = {
  Events: 'triggers',
  Actions: 'actions',
  ElseActions: 'elseActions',
  Condition: 'condition',
  DefaultCase: 'default',
  Cases: 'cases',
};
export const defaultPublishConfig = {
  name: 'default',
  type: 'localpublish',
  configuration: JSON.stringify({}),
};
export const DEFAULT_RUNTIME = 'dotnet';
