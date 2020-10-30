// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, JsonSchemaFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

export const extractSchemaProperties = (dialog: DialogInfo, jsonSchemaFiles: JsonSchemaFile[]): string[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaRef: any = dialog.content?.schema;

  if (schemaRef) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: any = undefined;

    if (schemaRef.$public || schemaRef.properties) {
      schema = schemaRef;
    } else {
      schema = jsonSchemaFiles.find(
        (file) => file.id === getBaseName(schemaRef as string) || file.id === dialog.content.schema
      )?.content;
    }

    if (schema) {
      if (schema?.$public && Array.isArray(schema.$public)) {
        return schema.$public;
      }
      if (schema?.properties) {
        return Object.keys(schema.properties) ?? [];
      }
    }
  }

  return [];
};
