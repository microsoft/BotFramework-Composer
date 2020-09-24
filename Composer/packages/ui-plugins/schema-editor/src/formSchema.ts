// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension-client';
import { SDKKinds } from '@bfc/shared';

import { SchemaEditorField } from './Fields/SchemaEditorField';

const uiSchema: UISchema = {
  [SDKKinds.AdaptiveDialog]: {
    form: {
      properties: {
        schemaEditor: {
          field: SchemaEditorField,
        },
      },
    },
  },
};

export default uiSchema;
