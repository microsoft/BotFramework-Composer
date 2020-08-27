// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import memoize from 'lodash/memoize';

export const CIRCULAR_REFS = [
  'Microsoft.IDialog',
  'Microsoft.IRecognizer',
  'Microsoft.ILanguageGenerator',
  'Microsoft.ITriggerSelector',
  'Microsoft.AdaptiveDialog',
  'schema',
];

export const isCircular = memoize((def: string) => CIRCULAR_REFS.some((kind) => def.includes(kind)));
