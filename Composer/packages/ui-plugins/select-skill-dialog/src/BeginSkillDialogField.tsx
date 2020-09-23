// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';
import { ObjectField } from '@bfc/adaptive-form';

import { SelectSkillDialog } from './SelectSkillDialogField';

export const BeginSkillDialogField: React.FC<FieldProps> = (props) => {
  const { value, onChange } = props;

  return (
    <React.Fragment>
      <SelectSkillDialog value={value} onChange={onChange} />
      <ObjectField {...props} />
    </React.Fragment>
  );
};
