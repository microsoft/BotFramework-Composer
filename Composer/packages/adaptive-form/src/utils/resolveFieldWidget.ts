// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldProps, FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension-client';

import * as DefaultFields from '../components/fields';
import { withTypeIcons } from '../components/withTypeIcons';

/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
export function resolveFieldWidget(params: {
  schema?: JSONSchema7;
  uiOptions?: UIOptions;
  globalUIOptions?: FormUISchema;
  value?: any;
  expression?: boolean;
  isOneOf?: boolean;
}): { field: FieldWidget; customProps?: Partial<FieldProps> } {
  const { schema, uiOptions, globalUIOptions, value, expression, isOneOf } = params;

  const FieldOverride = uiOptions?.field;

  if (typeof FieldOverride === 'function') {
    return { field: FieldOverride };
  }

  if (schema) {
    let baseField: FieldWidget;
    const showIntellisense = uiOptions?.intellisenseScopes?.length || expression;

    if (schema.$role) {
      switch (schema.$role) {
        case 'expression':
          return { field: DefaultFields.ExpressionField };
      }
    }

    if (globalUIOptions) {
      const KindOverride = schema.$kind && globalUIOptions[schema.$kind]?.field;

      if (KindOverride) {
        return { field: KindOverride };
      }
    }

    if ((schema.oneOf && Array.isArray(schema.oneOf)) || Array.isArray(schema.type)) {
      return { field: DefaultFields.OneOfField };
    }

    if (expression && typeof value === 'string' && value.startsWith('=')) {
      baseField = DefaultFields.IntellisenseExpressionField;
      return { field: isOneOf ? baseField : withTypeIcons(baseField) };
    }

    if (Array.isArray(schema.enum)) {
      return { field: DefaultFields.SelectField };
    }

    switch (schema.type) {
      case undefined:
      case 'string':
        baseField = showIntellisense ? DefaultFields.IntellisenseTextField : DefaultFields.StringField;
        return {
          field: isOneOf ? baseField : withTypeIcons(baseField),
        };

      case 'integer':
      case 'number':
        baseField = showIntellisense ? DefaultFields.IntellisenseNumberField : DefaultFields.NumberField;
        return {
          field: isOneOf ? baseField : withTypeIcons(baseField),
        };

      case 'boolean':
        baseField = DefaultFields.BooleanField;
        return { field: isOneOf ? baseField : withTypeIcons(baseField) };
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!schema.items && !schema.oneOf) {
          baseField = showIntellisense ? DefaultFields.IntellisenseJSONField : DefaultFields.JsonField;
          return {
            field: isOneOf ? baseField : withTypeIcons(baseField),
            customProps: { style: { height: 100 } },
          };
        }

        return { field: DefaultFields.ArrayField };
      }
      case 'object':
        if (schema.additionalProperties) {
          return { field: DefaultFields.OpenObjectField };
        } else if (!schema.properties) {
          baseField = showIntellisense ? DefaultFields.IntellisenseJSONField : DefaultFields.JsonField;
          return {
            field: isOneOf ? baseField : withTypeIcons(baseField),
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
