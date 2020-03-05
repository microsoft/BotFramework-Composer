// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { FieldLabel, resolveRef, resolveFieldWidget, usePluginConfig } from '@bfc/adaptive-form';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
// import { TooltipHost, TooltipDelay, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
// import { IconButton } from 'office-ui-fabric-react/lib/Button';
// import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
// import { NeutralColors } from '@uifabric/fluent-theme';

import { ExpressionEditor } from './ExpressionEditor';

const styles = {
  label: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  fieldWrapper: css`
    display: flex;
  `,
  field: css`
    display: flex;
    align-items: center;
    flex: 1;
  `,
};

const ExpressionField: React.FC<FieldProps> = props => {
  const { id, value = '', label, description, schema, uiOptions } = props;

  const pluginConfig = usePluginConfig();
  const [selectedSchema, setSelectedSchema] = useState<JSONSchema7 | null>(null);

  const oneOf = schema.oneOf;
  const options =
    oneOf &&
    (oneOf
      .map(s => {
        if (typeof s === 'object') {
          const resolved = resolveRef(s, props.definitions);

          return {
            key: resolved.type as React.ReactText,
            text: resolved.title || resolved.type,
            data: { schema: resolved },
          } as IDropdownOption;
        }
      })
      .filter(Boolean) as IDropdownOption[]);

  useEffect(() => {
    if (options) {
      if (!value) {
        setSelectedSchema(options[0].data.schema);
      } else {
        const selected = options.find(o => typeof value === o.key);
        setSelectedSchema(selected?.data.schema || options[0].data.schema);
      }
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
    if (selectedSchema?.type === 'string') {
      return <ExpressionEditor {...props} />;
    }

    const Field = resolveFieldWidget(selectedSchema || {}, uiOptions, pluginConfig);
    return <Field {...props} schema={selectedSchema || {}} label={false} />;
  };

  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      <div css={styles.fieldWrapper}>
        {options && options.length > 1 && (
          <Dropdown
            id={`${props.id}-type`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedSchema?.type}
            onChange={handleTypeChange}
            onRenderTitle={renderTypeTitle}
            styles={{
              root: { width: '110px', flexBasis: 'auto', marginRight: '10px' },
            }}
          />
        )}
        <div css={styles.field}>{renderField()}</div>
      </div>
    </React.Fragment>
  );
};

export { ExpressionField };
