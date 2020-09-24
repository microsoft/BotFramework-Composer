// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension-client';

import { FieldLabel } from '../FieldLabel';

export const AdditionalField: React.FC<FieldProps> = (props) => {
  const { id, description, label, required, uiOptions } = props;
  const { field: Field, helpLink } = uiOptions;

  return Field ? (
    <React.Fragment>
      <FieldLabel description={description} helpLink={helpLink} id={id} label={label} required={required} />
      <Field {...props} />
    </React.Fragment>
  ) : null;
};
