// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ObjectField } from '@bfc/adaptive-form';
import { FieldProps } from '@bfc/extension';

import { SchemaEditorField } from './SchemaEditorField';

export const AdaptiveDialogField: React.FC<FieldProps> = (props) => {
  return (
    <React.Fragment>
      <ObjectField {...props} />
      <SchemaEditorField />
    </React.Fragment>
  );
};
