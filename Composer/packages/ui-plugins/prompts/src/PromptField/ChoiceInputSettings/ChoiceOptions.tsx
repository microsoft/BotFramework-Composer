// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { FieldProps, ChangeHandler } from '@bfc/extension';
import { IChoiceOption } from '@bfc/shared';
import { JSONSchema4 } from 'json-schema';
import { SchemaField } from '@bfc/adaptive-form';

interface ChoiceOptionsProps extends Omit<FieldProps<IChoiceOption>, 'onChange'> {
  onChange: (field: keyof IChoiceOption) => ChangeHandler;
}

export const ChoiceOptions: React.FC<ChoiceOptionsProps> = props => {
  const { id, schema, value, onChange, ...rest } = props;

  const optionSchema = (field: keyof IChoiceOption): JSONSchema4 => {
    return get(schema, ['properties', field]);
  };

  return (
    <Fragment>
      <SchemaField
        {...rest}
        id={`${id}.inlineSeparator`}
        label={formatMessage('Inline separator')}
        schema={optionSchema('inlineSeparator')}
        value={value?.inlineSeparator}
        onChange={onChange('inlineSeparator')}
      />
      <SchemaField
        {...rest}
        id={`${id}.inlineOr`}
        label={formatMessage('Inline or')}
        schema={optionSchema('inlineOr')}
        value={value?.inlineOr}
        onChange={onChange('inlineOr')}
      />
      <SchemaField
        {...rest}
        id={`${id}.inlineOrMore`}
        label={formatMessage('Inline or more')}
        schema={optionSchema('inlineOrMore')}
        value={value?.inlineOrMore}
        onChange={onChange('inlineOrMore')}
      />
      <SchemaField
        {...rest}
        id={`${id}.includeNumbers`}
        label={formatMessage('Include numbers')}
        schema={optionSchema('includeNumbers')}
        value={value?.includeNumbers}
        onChange={onChange('includeNumbers')}
      />
    </Fragment>
  );
};
