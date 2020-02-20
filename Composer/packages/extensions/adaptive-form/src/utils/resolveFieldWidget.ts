// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { JSONSchema4 } from 'json-schema';
import { UIOptions, FieldWidget } from '@bfc/extension';

import * as DefaultFields from '../components/fields';

/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
export function resolveFieldWidget(schema?: JSONSchema4, uiOptions?: UIOptions): FieldWidget {
  const FieldOverride = uiOptions?.['ui:field'];

  if (typeof FieldOverride === 'function') {
    return FieldOverride;
  }

  if (schema) {
    if (schema.$role) {
      switch (schema.$role) {
        case 'expression':
          return DefaultFields.StringField;
      }
    }

    if (schema.$kind) {
      switch (schema.$kind) {
        case 'Microsoft.IRecognizer':
          return DefaultFields.RecognizerField;
      }
    }

    switch (schema.type) {
      case 'string':
        return schema.enum ? DefaultFields.SelectField : DefaultFields.StringField;
      case 'integer':
      case 'number':
        return DefaultFields.NumberField;
      case 'boolean':
        return DefaultFields.BooleanField;
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && items[0].type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!Array.isArray(items) && items?.type === 'object') {
          return DefaultFields.ObjectArrayField;
        }

        return DefaultFields.ArrayField;
      }
      case 'object':
        return schema.additionalProperties ? DefaultFields.OpenObjectField : DefaultFields.ObjectField;
    }
  }

  return DefaultFields.UnsupportedField;
}
