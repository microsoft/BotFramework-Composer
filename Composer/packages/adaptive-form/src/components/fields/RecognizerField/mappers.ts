// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';
import { RecognizerListItem } from './RecognizerField';

export const mapListItemsToRecognizerSchema = (item: RecognizerListItem, recognizerConfigs: RecognizerSchema[]) => {
  return recognizerConfigs.find((r) => r.id === item.key);
};

export const mapRecognizerSchemaToListItems = (recognizerSchema: RecognizerSchema) => {
  const { id, displayName, description } = recognizerSchema;
  const recognizerName = typeof displayName === 'function' ? displayName({}) : displayName;
  const recognizerDescription = typeof description === 'function' ? description({}) : description;
  return { key: id, text: recognizerName || id, description: recognizerDescription };
};
