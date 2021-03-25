// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MicrosoftIDialog, Diagnostic } from '@bfc/shared';
import { SchemaDefinitions } from '@bfc/shared/lib/schemaUtils/types';

export const validateSchema = (
  dialogId: string,
  dialogData: MicrosoftIDialog,
  schema: SchemaDefinitions
): Diagnostic[] => {
  console.log('id, data, schema', dialogId, dialogData, schema);
  return [];
};
