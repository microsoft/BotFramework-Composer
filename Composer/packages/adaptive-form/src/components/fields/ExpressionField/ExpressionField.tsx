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

  let intellisenseScopes = ['expressions'];
  if (uiOptions.intellisenseScopes?.length) {
    intellisenseScopes = intellisenseScopes.concat(uiOptions.intellisenseScopes);
  }

  const newUiOptions = { ...uiOptions, intellisenseScopes: intellisenseScopes, canBeExpression: true };

  const { field: Field, customProps } = resolveFieldWidget(newSchema, newUiOptions, formUIOptions, value);

  return <Field {...props} {...customProps} schema={newSchema} uiOptions={newUiOptions} />;
};

export { ExpressionField };
