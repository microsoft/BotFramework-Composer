// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension';

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
  globalUIOptions?: FormUISchema
): FieldWidget {
  const FieldOverride = uiOptions?.field;

  if (typeof FieldOverride === 'function') {
    return FieldOverride;
  }

  if (schema) {
    if (schema.$role) {
      switch (schema.$role) {
        case 'expression':
          return DefaultFields.ExpressionField;
      }
    }

    if (globalUIOptions) {
      const KindOverride = schema.$kind && globalUIOptions[schema.$kind]?.field;

      if (KindOverride) {
        return KindOverride;
      }
    }

    if ((schema.oneOf && Array.isArray(schema.oneOf)) || Array.isArray(schema.type)) {
      return DefaultFields.OneOfField;
    }

    if (Array.isArray(schema.enum)) {
      return DefaultFields.SelectField;
    }

    if (uiOptions?.intellisenseScopes?.length) {
      return DefaultFields.IntellisenseField;
    }

    switch (schema.type) {
      case undefined:
      case 'string':
        return DefaultFields.StringField;
      case 'integer':
      case 'number':
        return DefaultFields.NumberField;
      case 'boolean':
        return DefaultFields.BooleanField;
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
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
