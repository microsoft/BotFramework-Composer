// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { SchemaField } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';

import { SchemaEditorField } from './SchemaEditorField';

export const AdaptiveDialogField: React.FC<FieldProps> = ({ uiOptions, ...rest }) => {
  return (
    <React.Fragment>
      <SchemaField {...rest} uiOptions={{ ...uiOptions, field: undefined }} />
      <SchemaEditorField />
    </React.Fragment>
  );
};
