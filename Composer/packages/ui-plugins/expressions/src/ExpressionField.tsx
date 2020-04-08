// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useMemo, useState } from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { FieldLabel, resolveRef, resolveFieldWidget, usePluginConfig } from '@bfc/adaptive-form';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';
import isNumber from 'lodash/isNumber';

import { ExpressionEditor } from './ExpressionEditor';

const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    label: ExpressionField;
  `,
  field: css`
    min-height: 66px;
  `,
};

const getValueType = (value: any) => {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (isNumber(value)) {
    return Number.isInteger(value) ? 'integer' : 'number';
  }

  return typeof value;
};

const getOptions = (schema: JSONSchema7, definitions): IDropdownOption[] => {
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

          return {
            key: resolved.title?.toLowerCase() || resolved.type,
            text: resolved.title?.toLowerCase() || resolved.type,
            data: { schema: resolved },
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
};

const getSelectedOption = (value: any | undefined, options: IDropdownOption[]): IDropdownOption | undefined => {
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
        return itemSchema && typeof item === itemSchema.type;
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
};

const ExpressionField: React.FC<FieldProps> = props => {
  const { id, value = '', label, description, schema, uiOptions, definitions } = props;
  const { $role, ...expressionSchema } = schema;
  const pluginConfig = usePluginConfig();

  const options = useMemo(() => getOptions(expressionSchema, definitions), []);
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
    if (option && option.key !== selectedKey) {
      setSelectedOption(option);
      props.onChange(undefined);
    }
  };

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];
    return option ? <React.Fragment>{option.text}</React.Fragment> : null;
  };

  const renderField = () => {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }

    if (selectedKey === 'expression') {
      return <ExpressionEditor {...props} />;
    }

    // return a json editor for open ended obejcts
    if (
      (selectedSchema.type === 'object' && !selectedSchema.properties) ||
      (selectedSchema.type === 'array' && !selectedSchema.items)
    ) {
      const defaultValue = selectedSchema.type === 'object' ? {} : [];
      return (
        <JsonEditor
          key={selectedSchema.type}
          id={props.id}
          onChange={props.onChange}
          value={value || defaultValue}
          height={100}
          schema={selectedSchema}
        />
      );
    }

    const Field = resolveFieldWidget(selectedSchema, uiOptions, pluginConfig);
    return (
      <Field
        key={selectedSchema.type}
        {...props}
        schema={selectedSchema}
        // allow object fields to render their labels
        label={selectedSchema.type !== 'object' ? false : undefined}
        css={{ label: 'ExpressionFieldValue' }}
        transparentBorder={false}
      />
    );
  };

  const shouldRenderContainer = label || (options && options.length > 1);
  const dropdownWidth = useMemo(
    () => (options.reduce((maxLength, { text }) => Math.max(maxLength, text.length), 0) > 'expression'.length ? -1 : 0),
    [options]
  );

  return (
    <React.Fragment>
      {shouldRenderContainer && (
        <div css={styles.container}>
          <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
          {options && options.length > 1 && (
            <Dropdown
              id={`${props.id}-type`}
              dropdownWidth={dropdownWidth}
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
              data-testid={`expression-type-dropdown-${label}`}
              ariaLabel={formatMessage('select property type')}
            />
          )}
        </div>
      )}
      {renderField()}
    </React.Fragment>
  );
};

export { ExpressionField };
