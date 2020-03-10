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
    'keyPhrase',
    'money',
    'number',
    'ordinal',
    'ordinalV2',
    'percentage',
    'personName',
    'phonenumber',
    'temperature',
    'url',
    'datetime',
  ],
};

export type LineState = 'listEntity' | 'utterance' | 'mlEntity' | 'other';
