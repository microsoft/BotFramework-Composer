// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { FieldLabel, resolveRef, resolveFieldWidget, usePluginConfig } from '@bfc/adaptive-form';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { JsonEditor } from '@bfc/code-editor';

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

const getOptions = (schema: JSONSchema7, definitions): IDropdownOption[] => {
  const { type, oneOf } = schema;

  if (type && Array.isArray(type)) {
    const options: IDropdownOption[] = type.map(t => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));

    type.length > 2 &&
      options.push({
        key: 'expression',
        text: 'expression',
        data: { schema: { ...schema, type: 'string' } },
      });

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

  return [
    {
      key: 'expression',
      text: 'expression',
      data: { schema: { ...schema, type: 'string' } },
    },
  ];
};

const getSelectedOption = (value: any | undefined, options: IDropdownOption[]): IDropdownOption | undefined => {
  const expressionOption = options.find(({ key }) => key === 'expression');
  const valueType = Array.isArray(value) ? 'array' : typeof value;

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
  if (!value) {
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
  return options.find(o => o.data.schema.type === valueType) || options[0];
};

const ExpressionField: React.FC<FieldProps> = props => {
  const { id, value = '', label, description, schema, uiOptions, definitions } = props;
  const { $role, ...expressionSchema } = schema;
  const pluginConfig = usePluginConfig();

  const options = useMemo(() => getOptions(expressionSchema, definitions), []);
  const initialSelectedOption = useMemo(() => getSelectedOption(value, options) || ({} as IDropdownOption), []);

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

    const Field = resolveFieldWidget(selectedSchema || {}, uiOptions, pluginConfig);
    return (
      <Field
        key={selectedSchema.type}
        {...props}
        schema={selectedSchema || {}}
        // allow object fields to render their labels
        label={selectedSchema.type !== 'object' ? false : undefined}
        css={{ label: 'ExpressionFieldValue' }}
      />
    );
  };

  const shouldRenderContainer = label || (options && options.length > 1);

  return (
    <React.Fragment>
      {shouldRenderContainer && (
        <div css={styles.container}>
          <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
          {options && options.length > 1 && (
            <Dropdown
              id={`${props.id}-type`}
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
            />
          )}
        </div>
      )}
      {renderField()}
    </React.Fragment>
  );
};

export { ExpressionField };
