// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension-client';

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
  value?: any
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

    if (uiOptions?.canBeExpression && typeof value === 'string' && value.startsWith('=')) {
      return DefaultFields.IntellisenseTextField;
    }

    if ((schema.oneOf && Array.isArray(schema.oneOf)) || Array.isArray(schema.type)) {
      return DefaultFields.OneOfField;
    }

    if (Array.isArray(schema.enum)) {
      return DefaultFields.SelectField;
    }

    switch (schema.type) {
      case undefined:
      case 'string':
        return uiOptions?.intellisenseScopes?.length ? DefaultFields.IntellisenseTextField : DefaultFields.StringField;

      case 'integer':
      case 'number':
        return uiOptions?.intellisenseScopes?.length
          ? DefaultFields.IntellisenseNumberField
          : DefaultFields.NumberField;

      case 'boolean':
        return DefaultFields.BooleanField;
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!schema.items && !schema.oneOf) {
          return (props) => DefaultFields.JsonField({ ...props, height: 100, value: props.value || {}, key: 'array' });
        }

        return DefaultFields.ArrayField;
      }
      case 'object':
        if (schema.additionalProperties) {
          return DefaultFields.OpenObjectField;
        } else if (!schema.properties) {
          return (props) => DefaultFields.JsonField({ ...props, height: 100, value: props.value || {}, key: 'object' });
        } else {
          return uiOptions?.fieldSets ? DefaultFields.FieldSets : DefaultFields.ObjectField;
        }
    }
  }

  return DefaultFields.UnsupportedField;
}
