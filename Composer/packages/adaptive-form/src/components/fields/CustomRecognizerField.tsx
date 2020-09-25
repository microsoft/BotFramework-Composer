// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { JsonEditor } from '@bfc/code-editor';

export const CustomRecognizerField: React.FC<FieldProps> = (props) => {
  const { value, onChange } = props;
  return (
    <JsonEditor
      key="customRecognizerField"
      height={200}
      id="customRecognizerField"
      value={value as object}
      onChange={onChange}
    />
  );
};
