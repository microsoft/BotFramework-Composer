// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps, JSONSchema7, SchemaDefinitions } from '@bfc/extension-client';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import formatMessage from 'format-message';

import { getUiDescription, getUiPlaceholder, getValueType, resolveRef } from '../../../utils';
import { getFieldIconText } from '../../../utils/getFieldIconText';

function getOptionLabel(schema: JSONSchema7): string {
  const { title, enum: enumOptions } = schema;
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  if (title) {
    return title.toLowerCase();
  }

  if (Array.isArray(enumOptions) && enumOptions.length > 0) {
    return 'dropdown';
  }

  return type || 'unknown';
}

const typePriorityWeights = {
  string: 5,
  number: 4,
  boolean: 3,
  array: 2,
  object: 1,
};

const sortOptionsByTypeWeights = ({ key: type1 }, { key: type2 }): number => {
  return (typePriorityWeights[type1] || 0) > (typePriorityWeights[type2] || 0) ? -1 : 1;
};

export function getOptions(
  schema: JSONSchema7,
  definitions?: SchemaDefinitions
): { options: IDropdownOption[]; isNested: boolean } {
  const { type, oneOf, additionalProperties } = schema;

  let isNested = !!additionalProperties;

  if (type && Array.isArray(type)) {
    const options: IDropdownOption[] = type.map((t) => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t }, icon: getFieldIconText(t) },
    }));

    options.sort(sortOptionsByTypeWeights);

    return { options, isNested };
  }

  if (oneOf && Array.isArray(oneOf)) {
    const resolvedOneOf = oneOf.map((s) => (typeof s === 'object' ? resolveRef(s, definitions) : s));
    const options = resolvedOneOf
      .map((s) => {
        if (typeof s === 'object') {
          const merged = merge({}, omit(schema, 'oneOf'), s);
          const label = getOptionLabel(s);

          if (s.$role !== 'expression') {
            return {
              key: label,
              text: label,
              data: { schema: merged, icon: getFieldIconText(s.type) },
            } as IDropdownOption;
          }
        }
      })
      .filter(Boolean) as IDropdownOption[];

    options.sort(sortOptionsByTypeWeights);

    const expression = (resolvedOneOf as JSONSchema7[]).find(({ $role }) => $role === 'expression');
    const merged = merge({}, omit(schema, 'oneOf'), expression);

    isNested =
      isNested ||
      !!(expression && (resolvedOneOf as JSONSchema7[]).some(({ properties, items }) => properties || items));

    if (expression && isNested) {
      options.push({
        key: 'expression',
        text: formatMessage('Write an expression'),
        data: {
          icon: getFieldIconText('expression'),
          schema: merged,
        },
      });
    }

    return { options, isNested };
  }

  return { options: [], isNested };
}

export function getSelectedOption(value: any | undefined, options: IDropdownOption[]): IDropdownOption | undefined {
  if (options.length === 0) {
    return;
  }

  // if the value if undefined, default to the first option
  if (typeof value === 'undefined' || value === null) {
    return options[0];
  }

  const valueType = getValueType(value);

  if (valueType === 'array') {
    const item = value[0];
    const firstArrayOption = options.find((o) => o.data.schema.type === 'array');

    // if there is nothing in the array, default to the first array type
    if (!item) {
      return firstArrayOption;
    }

    // else, find the option with an item schema that matches item type
    return (
      options.find((o) => {
        const {
          data: { schema },
        } = o;

        const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
        return itemSchema && getValueType(item) === itemSchema.type;
      }) || firstArrayOption
    );
  }

  if (valueType === 'integer') {
    return (
      options.find(({ data }) => data.schema.type === valueType) ||
      options.find(({ data }) => data.schema.type === 'number') ||
      options[0]
    );
  }

  // lastly, attempt to find the option based on value type
  return options.find(({ data }) => data?.schema.type === valueType) || options[0];
}

export function getFieldProps(props: FieldProps, schema?: JSONSchema7): FieldProps {
  const enumOptions = schema?.enum as string[];

  return {
    ...props,
    enumOptions,
    schema: schema || {},
    // allows object fields to render their labels
    label: schema?.type === 'object' ? undefined : false,
    placeholder: getUiPlaceholder({ ...props }),
    description: getUiDescription({ ...props, description: undefined }),
  };
}
