// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { MicrosoftInputDialog } from '@bfc/shared';
import { SchemaField, getLabel, ErrorMessage } from '@bfc/adaptive-form';

import { settingsFieldHalf, settingsFields } from './styles';
import { InputDialogKeys, PromptFieldProps } from './types';

interface TwoSettingFieldsProps extends PromptFieldProps<MicrosoftInputDialog> {
  fields: InputDialogKeys[];
}

const errorStyles = css`
  width: 100%;
  margin-top: -10px;

  label: PromptSettingsError;
`;

export const TwoSettingFields: React.FC<TwoSettingFieldsProps> = props => {
  const { fields, value, id, getSchema, onChange, uiOptions, rawErrors, ...rest } = props;

  let error;

  for (const field of fields) {
    if (typeof rawErrors?.[field] === 'string') {
      error = (
        <span css={errorStyles}>
          <ErrorMessage
            error={rawErrors?.[field]}
            label={getLabel({
              ...props,
              schema: getSchema(field),
              uiOptions: uiOptions?.properties?.[field] || {},
            })}
          />
        </span>
      );
      break;
    }
  }

  return (
    <div css={settingsFields}>
      {fields.map((field, index) => (
        <div key={index} css={settingsFieldHalf}>
          <SchemaField
            {...rest}
            hideError
            id={`${id}.${field}`}
            rawErrors={rawErrors?.[field]}
            schema={getSchema(field)}
            uiOptions={uiOptions.properties?.[field] || {}}
            value={value?.[field]}
            onChange={onChange(field)}
          />
        </div>
      ))}
      {error}
    </div>
  );
};
