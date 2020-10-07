// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldProps, FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension-client';

import * as DefaultFields from '../components/fields';

/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
export function resolveFieldWidget(
  schema?: JSONSchema7,
  uiOptions?: UIOptions,
  globalUIOptions?: FormUISchema,
  value?: any,
  expression?: boolean
): { field: FieldWidget; customProps?: Partial<FieldProps> } {
  const FieldOverride = uiOptions?.field;

  if (typeof FieldOverride === 'function') {
    return { field: FieldOverride };
  }

  if (schema) {
    if (schema.$role) {
      switch (schema.$role) {
        case 'expression':
          return { field: DefaultFields.ExpressionField };
      }
    }

    if (globalUIOptions) {
      const KindOverride = schema.$kind && globalUIOptions[schema.$kind]?.field;

      if (KindOverride) {
        return KindOverride;
      }
    }

    if (expression && typeof value === 'string' && value.startsWith('=')) {
      return { field: DefaultFields.IntellisenseTextField };
    }

    if ((schema.oneOf && Array.isArray(schema.oneOf)) || Array.isArray(schema.type)) {
      return { field: DefaultFields.OneOfField };
    }

    if (Array.isArray(schema.enum)) {
      return { field: DefaultFields.SelectField };
    }

    switch (schema.type) {
      case undefined:
      case 'string':
        return {
          field: uiOptions?.intellisenseScopes?.length
            ? DefaultFields.IntellisenseTextField
            : DefaultFields.StringField,
        };

      case 'integer':
      case 'number':
        return {
          field: uiOptions?.intellisenseScopes?.length
            ? DefaultFields.IntellisenseNumberField
            : DefaultFields.NumberField,
        };

      case 'boolean':
        return { field: DefaultFields.BooleanField };
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!schema.items && !schema.oneOf) {
          return {
            field: uiOptions?.intellisenseScopes?.length
              ? DefaultFields.IntellisenseJSONField
              : DefaultFields.JsonField,
            customProps: { style: { height: 100 } },
          };
        }

        return { field: DefaultFields.ArrayField };
      }
      case 'object':
        if (schema.additionalProperties) {
          return { field: DefaultFields.OpenObjectField };
        } else if (!schema.properties) {
          return {
            field: uiOptions?.intellisenseScopes?.length
              ? DefaultFields.IntellisenseJSONField
              : DefaultFields.JsonField,
            customProps: { style: { height: 100 } },
          };
        } else if (uiOptions?.fieldsets) {
          return { field: uiOptions.pivotFieldsets ? DefaultFields.PivotFieldsets : DefaultFields.Fieldsets };
        } else {
          return { field: DefaultFields.ObjectField };
        }
    }
  }

  return { field: DefaultFields.UnsupportedField };
}
