// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { EditableField } from '@bfc/adaptive-form';

const SynonymsField: React.FC<FieldProps<string[]>> = props => {
  const { value = [], ...rest } = props;

  return <EditableField {...rest} value={(value || []).join(', ')} />;
};

export { SynonymsField };
