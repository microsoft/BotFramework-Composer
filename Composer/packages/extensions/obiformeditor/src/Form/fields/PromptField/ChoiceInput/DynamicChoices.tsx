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
  onChange?: (value: IChoice[]) => void;
  schema: JSONSchema6;
}

export const DynamicChoices: React.FC<DynamicChoicesProps> = ({
  formData: [{ value = '' }] = [{}],
  onChange,
  schema: { description },
}) => {
  return (
    <TextField onChange={(_, value) => onChange && onChange([{ value }])} value={value} placeholder={description} />
  );
};
