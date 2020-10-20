// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useFormConfig } from '@bfc/extension-client';
import React from 'react';
import omit from 'lodash/omit';

import { resolveFieldWidget } from '../../../utils';

const ExpressionField: React.FC<FieldProps> = (props) => {
  const { schema, uiOptions, value } = props;

  const formUIOptions = useFormConfig();

  const newSchema = omit({ ...schema }, '$role');

  const { field: Field, customProps } = resolveFieldWidget({
    schema: newSchema,
    uiOptions,
    globalUIOptions: formUIOptions,
    value,
    expression: true,
  });

  return <Field {...props} {...customProps} expression schema={newSchema} uiOptions={uiOptions} />;
};

export { ExpressionField };
