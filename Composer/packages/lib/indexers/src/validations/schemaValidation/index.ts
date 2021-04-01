// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { MicrosoftIDialog, Diagnostic } from '@bfc/shared';
import { SchemaDefinitions } from '@botframework-composer/types';

import { walkAdaptiveDialog } from './walkAdaptiveDialog';

export const validateSchema = (
  dialogId: string,
  dialogData: MicrosoftIDialog,
  schema: SchemaDefinitions
): Diagnostic[] => {
  walkAdaptiveDialog;
  console.log('id, data, schema', dialogId, dialogData, schema.definitions);
  return [];
};
