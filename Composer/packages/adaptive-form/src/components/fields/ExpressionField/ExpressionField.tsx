// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldProps, useFormConfig } from '@bfc/extension-client';
import React from 'react';
import omit from 'lodash/omit';

import { resolveFieldWidget } from '../../../utils';

const ExpressionField: React.FC<FieldProps> = (props) => {
  const { schema, uiOptions: baseUiOptions, value } = props;

  const formUIOptions = useFormConfig();

  const newSchema = omit({ ...schema }, '$role');

  let intellisenseScopes = ['expressions'];
  if (baseUiOptions.intellisenseScopes?.length) {
    intellisenseScopes = intellisenseScopes.concat(baseUiOptions.intellisenseScopes);
  }

  const uiOptions = { ...baseUiOptions, intellisenseScopes };

  const Field = resolveFieldWidget(newSchema, uiOptions, formUIOptions, value, true);

  return <Field expression {...props} schema={newSchema} uiOptions={uiOptions} />;
};

export { ExpressionField };
