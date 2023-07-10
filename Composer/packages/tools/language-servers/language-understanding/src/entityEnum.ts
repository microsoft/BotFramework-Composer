// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const EntityTypesObj = {
  EntityType: ['ml', 'prebuilt', 'regex', 'list', 'composite', 'Pattern.any', 'phraseList'],
  Prebuilt: [
    'age',
    'datetimeV2',
    'dimension',
    'email',
    'geographyV2',
    'money',
    'number',
    'ordinal',
    'percentage',
    'personName',
    'phonenumber',
    'temperature',
    'url',
    'datetime',
  ],
};

export type LineState = 'listEntity' | 'utterance' | 'mlEntity' | 'other';
