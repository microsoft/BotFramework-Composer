// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps } from '@bfc/extension-client';

import { CollapseField } from '../CollapseField';
import { getFieldsets } from '../../utils';

import { ObjectField } from './ObjectField';

const Fieldsets: React.FC<FieldProps<object>> = (props) => {
  const { schema, uiOptions: baseUiOptions, value } = props;

  const fieldsets = getFieldsets(schema, baseUiOptions, value);

  return (
    <React.Fragment>
      {fieldsets.map(({ schema, uiOptions, title, defaultExpanded }, key) => (
        <CollapseField
          key={key}
          defaultExpanded={defaultExpanded}
          title={typeof title === 'function' ? title(value) : title}
        >
          <ObjectField {...props} schema={schema} uiOptions={uiOptions} />
        </CollapseField>
      ))}
    </React.Fragment>
  );
};

export { Fieldsets };
