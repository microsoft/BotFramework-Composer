// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic } from '@bfc/shared';
import formatMessage from 'format-message';
import { DiagnosticSeverity, MicrosoftAdaptiveDialog, SchemaDefinitions } from '@botframework-composer/types';

import { walkAdaptiveDialog } from './walkAdaptiveDialog';

const SCHEMA_NOT_FOUND = formatMessage('Schema definition not found in sdk.schema.');

export const validateSchema = (
  dialogId: string,
  dialogData: MicrosoftAdaptiveDialog,
  schema: SchemaDefinitions
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const schemas: any = schema.definitions ?? {};

  walkAdaptiveDialog(dialogData, schemas, ($kind, data, path) => {
    if (!schemas[$kind]) {
      diagnostics.push(
        new Diagnostic(`${$kind}: ${SCHEMA_NOT_FOUND}`, `${dialogId}.dialog`, DiagnosticSeverity.Error, path)
      );
    }
    return true;
  });

  return diagnostics;
};
