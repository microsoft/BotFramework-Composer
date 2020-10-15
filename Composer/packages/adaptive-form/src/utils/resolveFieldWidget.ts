// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldProps, FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension-client';

import * as DefaultFields from '../components/fields';
import { withTypeIcons } from '../components/withTypeIcons';

const IntellisenseTextFieldWithIcon = withTypeIcons(DefaultFields.IntellisenseTextField);
const StringFieldWithIcon = withTypeIcons(DefaultFields.StringField);
const IntellisenseNumberFieldWithIcon = withTypeIcons(DefaultFields.IntellisenseNumberField);
const NumberFieldWithIcon = withTypeIcons(DefaultFields.NumberField);
const BooleanFieldWithIcon = withTypeIcons(DefaultFields.BooleanField);
const JsonFieldWithIcon = withTypeIcons(DefaultFields.JsonField);
const IntellisenseJSONFieldWithIcon = withTypeIcons(DefaultFields.IntellisenseJSONField);
const IntellisenseExpressionFieldWithIcon = withTypeIcons(DefaultFields.IntellisenseExpressionField);

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
      return { field: isOneOf ? DefaultFields.IntellisenseExpressionField : IntellisenseExpressionFieldWithIcon };
    }

    if (Array.isArray(schema.enum)) {
      return { field: DefaultFields.SelectField };
    }

    switch (schema.type) {
      case undefined:
      case 'string':
        if (showIntellisense && isOneOf) {
          return { field: DefaultFields.IntellisenseTextField };
        } else if (showIntellisense && !isOneOf) {
          return { field: IntellisenseTextFieldWithIcon };
        } else if (!showIntellisense && !isOneOf) {
          return { field: StringFieldWithIcon };
        }
        return {
          field: DefaultFields.StringField,
        };

      case 'integer':
      case 'number':
        if (showIntellisense && isOneOf) {
          return { field: DefaultFields.IntellisenseNumberField };
        } else if (showIntellisense && !isOneOf) {
          return { field: IntellisenseNumberFieldWithIcon };
        } else if (!showIntellisense && !isOneOf) {
          return { field: NumberFieldWithIcon };
        }
        return {
          field: DefaultFields.NumberField,
        };

      case 'boolean':
        return { field: isOneOf ? DefaultFields.BooleanField : BooleanFieldWithIcon };
      case 'array': {
        const { items } = schema;

        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
          return { field: DefaultFields.ObjectArrayField };
        } else if (!schema.items && !schema.oneOf) {
          if (showIntellisense && isOneOf) {
            return { field: DefaultFields.IntellisenseJSONField, customProps: { style: { height: 100 } } };
          } else if (showIntellisense && !isOneOf) {
            return { field: IntellisenseJSONFieldWithIcon, customProps: { style: { height: 100 } } };
          } else if (!showIntellisense && !isOneOf) {
            return { field: JsonFieldWithIcon, customProps: { style: { height: 100 } } };
          }
          return {
            field: DefaultFields.JsonField,
            customProps: { style: { height: 100 } },
          };
        }

        return { field: DefaultFields.ArrayField };
      }
      case 'object':
        if (schema.additionalProperties) {
          return { field: DefaultFields.OpenObjectField };
        } else if (!schema.properties) {
          if (showIntellisense && isOneOf) {
            return { field: DefaultFields.IntellisenseJSONField, customProps: { style: { height: 100 } } };
          } else if (showIntellisense && !isOneOf) {
            return { field: IntellisenseJSONFieldWithIcon, customProps: { style: { height: 100 } } };
          } else if (!showIntellisense && !isOneOf) {
            return { field: JsonFieldWithIcon, customProps: { style: { height: 100 } } };
          }
          return {
            field: DefaultFields.JsonField,
            customProps: { style: { height: 100 } },
          };
        } else if (uiOptions?.fieldsets) {
          return {
            field:
              uiOptions.pivotFieldsets ||
              uiOptions.fieldsets.some(({ fields = [] }) => fields.some((field) => typeof field !== 'string'))
                ? DefaultFields.PivotFieldsets
                : DefaultFields.Fieldsets,
          };
        } else {
          return { field: DefaultFields.ObjectField };
        }
    }
  }

  return { field: DefaultFields.UnsupportedField };
}
