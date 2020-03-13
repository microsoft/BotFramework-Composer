// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { SchemaField } from '@bfc/adaptive-form';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

const style = {
  row: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -10px 0;
  `,
};

export const SetProperty: React.FC<FieldProps> = props => {
  const { className, depth, onChange, value, id, uiOptions, schema, ...rest } = props;

  return (
    <div>
      <div css={style.row}>
        <SchemaField
          {...rest}
          depth={depth + 1}
          id={`${id}.property`}
          schema={(schema?.properties?.property as JSONSchema7) || {}}
          uiOptions={uiOptions.properties?.property || {}}
          value={value?.property}
          onChange={() => {}}
        />
        <Dropdown
          id={`${props.id}-type`}
          options={[]}
          responsiveMode={ResponsiveMode.large}
          styles={{
            root: { flexBasis: 'auto', marginLeft: '16px', width: '110px' },
          }}
        />
      </div>
      <div css={style.row}>
        <SchemaField
          {...rest}
          depth={depth + 1}
          id={`${id}.value`}
          schema={(schema?.properties?.value as JSONSchema7) || {}}
          uiOptions={uiOptions.properties?.value || {}}
          value={value?.value}
          onChange={() => {}}
        />
      </div>
    </div>
  );
};
