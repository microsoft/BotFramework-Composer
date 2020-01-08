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

export enum UpdateScope {
  DialogFile,
  LgFile,
  LuFile,
}

export enum UpdateAction {
  UndoRedo,
}
