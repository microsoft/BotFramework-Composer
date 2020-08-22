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

export const LUISLocales = [
  'en-us',
  'ar-ar',
  'zh-cn',
  'nl-nl',
  'fr-fr',
  'fr-ca',
  'de-de',
  'gu-in',
  'hi-in',
  'it-it',
  'ja-jp',
  'ko-kr',
  'mr-in',
  'pt-br',
  'es-es',
  'es-mx',
  'ta-in',
  'te-in',
  'tr-tr',
];
