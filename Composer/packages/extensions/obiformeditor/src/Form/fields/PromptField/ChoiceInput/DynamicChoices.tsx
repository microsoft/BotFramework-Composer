// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IChoice } from '@bfc/shared';
import { JSONSchema6 } from 'json-schema';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

interface DynamicChoicesProps {
  formData?: any;
  onChange?: (value: IChoice[] | string) => void;
  schema: JSONSchema6;
}

export const DynamicChoices: React.FC<DynamicChoicesProps> = props => {
  const {
    formData = '',
    onChange,
    schema: { description },
  } = props;
  return (
    <TextField onChange={(_, value = '') => onChange && onChange(value)} value={formData} placeholder={description} />
  );
};
