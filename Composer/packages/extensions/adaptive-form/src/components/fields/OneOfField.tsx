// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { FieldProps, JSONSchema7, JSONSchema7Definition } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import isNumber from 'lodash/isNumber';

import { FieldLabel } from '../FieldLabel';
import { resolveRef, resolveFieldWidget } from '../../utils';
import { usePluginConfig } from '../../hooks';

import { oneOfField } from './styles';

const getValueType = (value: any) => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (isNumber(value)) {
    return Number.isInteger(value) ? 'integer' : 'number';
  }

  return typeof value;
};

const getOptions = (schema: JSONSchema7, definitions?: { [key: string]: JSONSchema7Definition }): IDropdownOption[] => {
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
};

const getSelectedOption = (value: any | undefined, options: IDropdownOption[]): IDropdownOption | undefined => {
  if (options.length === 0) {
    return;
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
        return itemSchema && typeof item === itemSchema.type;
      }) || firstArrayOption
    );
  }

  // if the value if undefined, default to the first option
  if (!value) {
    return options[0];
  }

  // lastly, attempt to find the option based on value type
  return options.find(({ data }) => data.schema.type === valueType) || options[0];
};

const OneOfField: React.FC<FieldProps> = props => {
  const { schema, value, definitions } = props;
  const pluginConfig = usePluginConfig();
  const options = useMemo(() => getOptions(schema, definitions), [schema, definitions]);
  const initialSelectedOption = useMemo(
    () => getSelectedOption(value, options) || ({ key: '', data: { schema: undefined } } as IDropdownOption),
    []
  );

  const [
    {
      key: selectedKey,
      data: { schema: selectedSchema },
    },
    setSelectedOption,
  ] = useState<IDropdownOption>(initialSelectedOption);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];
    return option ? <React.Fragment>{option.text}</React.Fragment> : null;
  };

  const Field = resolveFieldWidget(selectedSchema || {}, props.uiOptions, pluginConfig);

  return (
    <div css={oneOfField.container}>
      <div css={oneOfField.label}>
        <FieldLabel {...props} />
        {options && options.length > 1 && (
          <Dropdown
            id={`${props.id}-oneOf`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedKey}
            onChange={handleTypeChange}
            onRenderTitle={renderTypeTitle}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', minWidth: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
            ariaLabel={formatMessage('select property type')}
          />
        )}
      </div>
      <Field
        {...props}
        transparentBorder={false}
        schema={selectedSchema || {}}
        // allow object fields to render their labels
        label={selectedSchema?.type === 'object' ? undefined : false}
        depth={props.depth - 1}
      />
    </div>
  );
};

export { OneOfField };
