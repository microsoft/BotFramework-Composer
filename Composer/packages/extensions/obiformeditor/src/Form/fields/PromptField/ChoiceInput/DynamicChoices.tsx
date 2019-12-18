// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IChoice } from '@bfc/shared';
import { JSONSchema6 } from 'json-schema';

import { ExpressionWidget } from '../../../widgets/ExpressionWidget';
import { FormContext } from '../../../types';

interface DynamicChoicesProps {
  formContext: FormContext;
  formData?: any;
  onChange?: (value: IChoice) => void;
  schema: JSONSchema6;
}

export const DynamicChoices: React.FC<DynamicChoicesProps> = props => {
  const {
    formContext,
    formData = '',
    onChange,
    schema,
    schema: { description },
  } = props;
  return (
    <ExpressionWidget
      formContext={formContext}
      onChange={(_, value = '') => onChange && onChange(value)}
      options={{ hideLabel: true }}
      placeholder={description}
      value={formData}
      schema={schema}
    />
  );
};
