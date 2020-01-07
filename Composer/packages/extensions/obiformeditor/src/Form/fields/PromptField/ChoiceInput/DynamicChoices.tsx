// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IChoice } from '@bfc/shared';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';

import { ExpressionWidget } from '../../../widgets/ExpressionWidget';
import { FormContext } from '../../../types';

interface DynamicChoicesProps {
  id: string;
  formContext: FormContext;
  formData?: any;
  onChange?: (value: IChoice) => void;
  schema: JSONSchema6;
}

export const DynamicChoices: React.FC<DynamicChoicesProps> = props => {
  const {
    id,
    formContext,
    formData = '',
    onChange,
    schema,
    schema: { description },
  } = props;
  return (
    <ExpressionWidget
      id={id}
      label={formatMessage('Choice')}
      formContext={formContext}
      onChange={(_, value = '') => onChange && onChange(value)}
      options={{ hideLabel: true }}
      placeholder={description}
      value={formData}
      schema={schema}
    />
  );
};
