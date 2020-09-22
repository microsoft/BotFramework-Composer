// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';

import { CollapseField } from '../CollapseField';
import { getFieldSets } from '../../utils';

import { ObjectField } from './ObjectField';

export const FieldSets: React.FC<FieldProps<object>> = (props) => {
  const { schema, uiOptions: baseUiOptions, value } = props;
  const { fieldSets: _, ...uiOptions } = baseUiOptions;

  const fieldSets = getFieldSets(schema, baseUiOptions, value);

  return (
    <React.Fragment>
      {fieldSets.map(({ fields, schema, ...rest }, key) => (
        <CollapseField key={key} {...rest}>
          <ObjectField {...props} schema={schema} uiOptions={uiOptions} />
        </CollapseField>
      ))}
    </React.Fragment>
  );
};

export default FieldSets;
