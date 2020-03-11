// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect, useMemo } from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { FieldLabel, resolveRef, resolveFieldWidget, usePluginConfig } from '@bfc/adaptive-form';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

import { ExpressionEditor } from './ExpressionEditor';

const styles = {
  container: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
};

const getOptions = (schema: JSONSchema7, definitions): IDropdownOption[] | undefined => {
  const { type, oneOf } = schema;

  if (type && Array.isArray(type)) {
    return type.map(t => ({
      key: t,
      text: t,
      data: { schema: { ...schema, type: t } },
    }));
  }

  if (oneOf && Array.isArray(oneOf)) {
    return oneOf
      .map(s => {
        if (typeof s === 'object') {
          const resolved = resolveRef(s, definitions);

          return {
            key: resolved.type as React.ReactText,
            text: resolved.title || resolved.type,
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

  const options = useMemo(() => getOptions(schema, definitions), []);

  useEffect(() => {
    if (options) {
      if (!value) {
        setSelectedSchema(options[0].data.schema);
      } else {
        const selected = options.find(o => typeof value === o.key);
        setSelectedSchema(selected?.data.schema || options[0].data.schema);
      }
    } else {
      setSelectedSchema(schema);
    }
  }, []);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setSelectedSchema(option.data.schema);
      props.onChange(undefined);
    }
  };

  const renderTypeTitle = (options?: IDropdownOption[]) => {
    const option = options && options[0];

    if (option) {
      return <React.Fragment>{option.text}</React.Fragment>;
    }

    return null;
  };

  const renderField = () => {
    if (!selectedSchema || Array.isArray(selectedSchema.type) || !selectedSchema.type) {
      return null;
    }

    if (selectedSchema.type === 'string') {
      return <ExpressionEditor {...props} />;
    }

    if (['array', 'object'].includes(selectedSchema.type)) {
      return <ExpressionEditor {...props} />;
    }

    const Field = resolveFieldWidget(selectedSchema || {}, uiOptions, pluginConfig);
    return <Field {...props} schema={selectedSchema || {}} label={false} />;
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
            selectedKey={selectedSchema?.type}
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
