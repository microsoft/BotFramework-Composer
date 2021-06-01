// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerSchema } from '@bfc/extension-client';

export const mapListItemsToRecognizerSchema = (item: any, recognizerConfigs: RecognizerSchema[]) => {
  return recognizerConfigs.find((r) => r.id === item.key);
};

export const mapRecognizerSchemaToListItems = (recognizerSchema: RecognizerSchema) => {
  const { id, displayName, description } = recognizerSchema;
  const recognizerName = typeof displayName === 'function' ? displayName({}) : displayName;
  return { key: id, text: recognizerName || id, description: description };
};
