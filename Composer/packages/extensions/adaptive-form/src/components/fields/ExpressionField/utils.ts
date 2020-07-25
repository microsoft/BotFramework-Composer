// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, JSONSchema7Definition, SchemaDefinitions } from '@bfc/extension';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { resolveRef, getValueType } from '../../../utils';

export interface SchemaOption extends IDropdownOption {
  data: {
    schema: JSONSchema7;
  };
}

function getOptionLabel(schema: JSONSchema7, parent: JSONSchema7): string {
  const { title, enum: enumOptions, items } = schema;
  if (title) {
    return title.toLowerCase();
  }

  if (Array.isArray(enumOptions) && enumOptions.length > 0) {
    return 'dropdown';
  }

  let childType = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  // check array items
  if (!childType && typeof items === 'object') {
    const item = Array.isArray(items) ? items[0] : items;

    if (typeof item === 'object') {
      childType = Array.isArray(item.type) ? item.type[0] : item.type;
    }
  }

  const childLabel = childType || 'unknown';

  if (parent.type && !Array.isArray(parent.type)) {
    return `${parent.type} (${childLabel})`;
  }

  return childLabel;
}

export function getOneOfOptions(
  oneOf: JSONSchema7Definition[],
  parentSchema: JSONSchema7,
  definitions?: SchemaDefinitions
): SchemaOption[] {
  return oneOf.reduce((all, item) => {
    if (typeof item === 'object') {
      const resolved = resolveRef(item, definitions);

      // if item has a one of, recurse on it
      if (item.oneOf) {
        return all.concat(getOneOfOptions(item.oneOf, item, definitions));
      }

      const label = getOptionLabel(resolved, parentSchema);

      all.push({
        key: label,
        text: label,
        data: { schema: resolved },
      } as SchemaOption);
    }

    return all;
  }, [] as SchemaOption[]);
}

export function getOptions(schema: JSONSchema7, definitions): SchemaOption[] {
  const { type, oneOf, enum: enumOptions } = schema;

  const expressionOption = {
    key: 'expression',
    text: 'expression',
    data: { schema: { ...schema, type: 'string' as const } },
  };

  if (type && Array.isArray(type)) {
    const options: SchemaOption[] = type.map((t) => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));

    type.length > 2 && options.push(expressionOption);

    options.sort(({ text: t1 }, { text: t2 }) => (t1 > t2 ? 1 : -1));

    return options;
  }

  if (oneOf && Array.isArray(oneOf)) {
    return getOneOfOptions(oneOf, schema, definitions);
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

export function getSelectedOption(value: any | undefined, options: SchemaOption[]): SchemaOption | undefined {
  const expressionOption = options.find(({ key }) => key === 'expression');
  let valueType = getValueType(value);

  // if its an array, we know it's not an expression

  if (valueType === 'integer') {
    // integer-type values should also count as numbers as far as the schema goes
    valueType = 'number';
  } else if (valueType === 'array') {
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
        return typeof itemSchema === 'object' && getValueType(item) === itemSchema.type;
      }) || firstArrayOption
    );
  } else if (typeof value === 'undefined' || value === null) {
    // if the value if undefined, either default to expression or the first option
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
