// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, JsonSchemaFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

export const extractSchemaProperties = (dialog: DialogInfo, jsonSchemaFiles: JsonSchemaFile[]): string[] => {
  if (dialog.content?.schema) {
    const schema = jsonSchemaFiles.find(
      (file) => file.id === getBaseName(dialog.content.schema) || file.id === dialog.content.schema
    )?.content;
    if (schema?.$public && Array.isArray(schema.$public)) {
      return schema.$public;
    }
    if (schema?.properties) {
      return Object.keys(schema.properties) ?? [];
    }
  }

  return [];
};
