// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { resolveRef, getValueType } from '../../../utils';

export function getOptions(
  schema: JSONSchema7,
  definitions?: { [key: string]: JSONSchema7Definition }
): IDropdownOption[] {
  const { type, oneOf } = schema;

  if (type && Array.isArray(type)) {
    const options: IDropdownOption[] = type.map(t => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));

    options.sort(({ text: t1 }, { text: t2 }) => (t1 > t2 ? 1 : -1));

    return options;
  }

  if (oneOf && Array.isArray(oneOf)) {
    return oneOf
      .map(s => {
        if (typeof s === 'object') {
          const resolved = resolveRef(s, definitions);

          return {
            key: resolved.title?.toLowerCase() || resolved.type,
            text: resolved.title?.toLowerCase() || resolved.type,
            data: { schema: resolved },
          } as IDropdownOption;
        }
      })
      .filter(Boolean) as IDropdownOption[];
  }

  return [];
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

  // lastly, attempt to find the option based on value type
  return options.find(({ data }) => data.schema.type === valueType) || options[0];
}
