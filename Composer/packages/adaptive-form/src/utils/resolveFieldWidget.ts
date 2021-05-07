// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FieldProps, FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension-client';

import * as DefaultFields from '../components/fields';
import { WithTypeIcons } from '../components/WithTypeIcons';

const IntellisenseTextFieldWithIcon = WithTypeIcons(DefaultFields.IntellisenseTextField);
const StringFieldWithIcon = WithTypeIcons(DefaultFields.StringField);
const IntellisenseNumberFieldWithIcon = WithTypeIcons(DefaultFields.IntellisenseNumberField);
const NumberFieldWithIcon = WithTypeIcons(DefaultFields.NumberField);
const BooleanFieldWithIcon = WithTypeIcons(DefaultFields.BooleanField);
const JsonFieldWithIcon = WithTypeIcons(DefaultFields.JsonField);
const SelectFieldWithIcon = WithTypeIcons(DefaultFields.SelectField);
const IntellisenseJSONFieldWithIcon = WithTypeIcons(DefaultFields.IntellisenseJSONField);
const IntellisenseExpressionFieldWithIcon = WithTypeIcons(DefaultFields.IntellisenseExpressionField);

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

    if (expression && typeof value === 'string') {
      // The schema has two types of expressions: "equalsExpression" and "expression".
      // "equalsExpression" inputs start with "=". For those we want to have access to the adaptive expressions built-in functions and have intellisense surface it, thus using IntellisenseExpressionField.
      // "expression" inputs don't leverage the built-in functions. For those, we only want to show a regular text field (that could potentially leverage Intellisense for results other than built-in expression functions).
      if (value.startsWith('=')) {
        return { field: isOneOf ? DefaultFields.IntellisenseExpressionField : IntellisenseExpressionFieldWithIcon };
      } else {
        if (schema.enum?.includes(value)) {
          return { field: isOneOf ? DefaultFields.SelectField : SelectFieldWithIcon };
        } else if (showIntellisense && isOneOf) {
          return { field: DefaultFields.IntellisenseTextField };
        } else if (showIntellisense && !isOneOf) {
          return { field: IntellisenseTextFieldWithIcon };
        } else if (!showIntellisense && !isOneOf) {
          return { field: StringFieldWithIcon };
        }
        return {
          field: DefaultFields.StringField,
        };
      }
    }

    if (Array.isArray(schema.enum)) {
      return { field: isOneOf ? DefaultFields.SelectField : SelectFieldWithIcon };
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
        if (typeof schema.additionalProperties === 'object') {
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
