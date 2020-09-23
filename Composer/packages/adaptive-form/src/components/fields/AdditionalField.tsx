// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, FieldWidget } from '@bfc/extension-client';

import { FieldLabel } from '../FieldLabel';
import { schemaField } from '../SchemaField';

interface AdditionalFieldProps extends FieldProps {
  name: string;
  field: FieldWidget;
  helpLink?: string;
  description?: string;
  label?: string | false;
  required?: boolean;
}

export const AdditionalField: React.FC<AdditionalFieldProps> = (props) => {
  const { id, depth, description, field: Field, helpLink, label, required } = props;

  return (
    <div css={schemaField.container(depth)}>
      <FieldLabel description={description} helpLink={helpLink} id={id} label={label} required={required} />
      <Field {...props} />
    </div>
  );
};
