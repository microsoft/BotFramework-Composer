// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { getUiDescription, getUiPlaceholder, getValueType, resolveRef } from '../../../utils';

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

export function getOptions(
  schema: JSONSchema7,
  definitions?: { [key: string]: JSONSchema7Definition }
): IDropdownOption[] {
  const { type, oneOf } = schema;

  if (type && Array.isArray(type)) {
    const options: IDropdownOption[] = type.map((t) => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));

    options.sort(({ text: t1 }, { text: t2 }) => (t1 > t2 ? 1 : -1));

    return options;
  }

  if (oneOf && Array.isArray(oneOf)) {
    return oneOf
      .map((s) => {
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

  // lastly, attempt to find the option based on value type
  return options.find(({ data }) => data.schema.type === valueType) || options[0];
}

export function getFieldProps(props: FieldProps, schema?: JSONSchema7): FieldProps {
  const enumOptions = schema?.enum as string[];

  return {
    ...props,
    enumOptions,
    schema: schema || {},
    transparentBorder: false,
    // allows object fields to render their labels
    label: schema?.type === 'object' ? undefined : false,
    depth: props.depth - 1,
    placeholder: getUiPlaceholder({ ...props }),
    description: getUiDescription({ ...props, description: undefined }),
  };
}
