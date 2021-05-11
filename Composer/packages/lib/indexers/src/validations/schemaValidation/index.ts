// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Diagnostic } from '@bfc/shared';
import formatMessage from 'format-message';
import { BaseSchema, DiagnosticSeverity, SchemaDefinitions } from '@botframework-composer/types';

import { walkAdaptiveDialog } from './walkAdaptiveDialog';

export const validateSchema = (dialogId: string, dialogData: BaseSchema, schema: SchemaDefinitions): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const schemas: any = schema.definitions ?? {};

  walkAdaptiveDialog(dialogData, schemas, ($kind, data, path) => {
    if (!schemas[$kind]) {
      diagnostics.push(
        new Diagnostic(
          formatMessage(
            'Components of $kind "{kind}" are not supported. Replace with a different component or create a custom component.',
            { kind: $kind }
          ),
          `${dialogId}.dialog`,
          DiagnosticSeverity.Error,
          path
        )
      );
    }
    return true;
  });

  return diagnostics;
};
