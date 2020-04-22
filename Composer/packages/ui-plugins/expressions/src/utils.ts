// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7 } from '@bfc/extension';
import { resolveRef, getValueType } from '@bfc/adaptive-form';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import merge from 'lodash/merge';
import omit from 'lodash/omit';

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

export function getOptions(schema: JSONSchema7, definitions): IDropdownOption[] {
  const { type, oneOf, enum: enumOptions } = schema;

  const expressionOption = {
    key: 'expression',
    text: 'expression',
    data: { schema: { ...schema, type: 'string' } },
  };

  if (type && Array.isArray(type)) {
    const options: IDropdownOption[] = type.map(t => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));

    type.length > 2 && options.push(expressionOption);

    options.sort(({ text: t1 }, { text: t2 }) => (t1 > t2 ? 1 : -1));

    return options;
  }

  if (oneOf && Array.isArray(oneOf)) {
    return oneOf
      .map(s => {
        if (typeof s === 'object') {
          const resolved = resolveRef(s, definitions);
          const merged = merge({}, omit(schema, 'oneOf'), resolved);
          const label = getOptionLabel(resolved);

          return {
            key: label,
            text: label,
            data: { schema: merged },
          } as IDropdownOption;
        }
      })
      .filter(Boolean) as IDropdownOption[];
  }

  // this could either be an expression or an enum value
  if (Array.isArray(enumOptions)) {
    return [
      {
        key: 'dropdown',
        text: 'dropdown',
        data: { schema: { ...schema, $role: undefined } },
      },
      expressionOption,
    ];
  }

  return [expressionOption];
}

export function getSelectedOption(value: any | undefined, options: IDropdownOption[]): IDropdownOption | undefined {
  const expressionOption = options.find(({ key }) => key === 'expression');
  const valueType = getValueType(value);

  // if its an array, we know it's not an expression
  if (valueType === 'array') {
    const item = value[0];
    const firstArrayOption = options.find(o => o.data.schema.type === 'array');

    // if there is nothing in the array, default to the first array type
    if (!item) {
      return firstArrayOption;
    }

    // else, find the option with an item schema that matches item type
    return (
      options.find(o => {
        const {
          data: { schema },
        } = o;

        const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
        return itemSchema && getValueType(item) === itemSchema.type;
      }) || firstArrayOption
    );
  }

  // if the value if undefined, either default to expression or the first option
  if (typeof value === 'undefined' || value === null) {
    return options.length > 2 ? expressionOption : options[0];
    // else if the value is a string and starts with '=' it is an expression
  } else if (
    expressionOption &&
    valueType === 'string' &&
    (value.startsWith('=') || !options.find(({ key }) => key === 'string'))
  ) {
    return expressionOption;
  }

  // lastly, attempt to find the option based on value type
  return options.find(({ data, key }) => data.schema.type === valueType && key !== 'expression') || options[0];
}
