// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useLayoutEffect, useMemo } from 'react';
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

const getOptions = (schema: JSONSchema7, definitions): IDropdownOption[] | undefined => {
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
            key: resolved.type as React.ReactText,
            text: resolved.title?.toLowerCase() || resolved.type,
            data: { schema: resolved },
          } as IDropdownOption;
        }
      })
      .filter(Boolean) as IDropdownOption[];
  }
};

const ExpressionField: React.FC<FieldProps> = props => {
  const { id, value = '', label, description, schema, uiOptions, definitions } = props;

  const pluginConfig = usePluginConfig();
  const [selectedSchema, setSelectedSchema] = useState<JSONSchema7 | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const options = useMemo(() => getOptions(schema, definitions), []);

  useLayoutEffect(() => {
    if (options) {
      if (typeof value === 'undefined') {
        const expression = options.find(({ key }) => key === 'expression');
        const {
          data: { schema },
        } = expression || options[0];

        setSelectedSchema(schema);
        setSelectedType(expression ? 'expression' : schema.type);
      } else {
        const selected = options.find(o => (Array.isArray(value) ? 'array' : typeof value) === o.key);

        setSelectedType(
          selected?.data.schema.type === 'string' && value.startsWith('=')
            ? 'expression'
            : selected?.data.schema.type || options[0].data.schema.type
        );

        setSelectedSchema(selected?.data.schema || options[0].data.schema);
      }
    } else {
      setSelectedSchema({ ...schema, $role: undefined });
    }
  }, []);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setSelectedSchema(option.data.schema);
      setSelectedType(option.text);

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

    if (selectedType === 'expression') {
      return <ExpressionEditor {...props} />;
    }

    if (['array', 'object'].includes(selectedSchema.type)) {
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
    return <Field key={selectedSchema.type} {...props} schema={selectedSchema || {}} label={false} />;
  };

  return (
    <React.Fragment>
      <div css={styles.container}>
        <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
        {options && options.length > 1 && (
          <Dropdown
            id={`${props.id}-type`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedType}
            onChange={handleTypeChange}
            onRenderTitle={renderTypeTitle}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { flexBasis: 'auto', padding: '5px 0', width: '110px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
          />
        )}
      </div>
      {renderField()}
    </React.Fragment>
  );
};

export { ExpressionField };
