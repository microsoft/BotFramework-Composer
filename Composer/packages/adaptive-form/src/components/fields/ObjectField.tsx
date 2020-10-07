// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FieldProps } from '@bfc/extension-client';

import { getOrderedProperties, getSchemaWithAdditionalFields } from '../../utils';
import { FormRow } from '../FormRow';

const ObjectField: React.FC<FieldProps<object>> = function ObjectField(props) {
  const { schema: baseSchema, uiOptions, depth, value, label, ...rest } = props;

  if (!baseSchema) {
    return null;
  }

  const schema = getSchemaWithAdditionalFields(baseSchema, uiOptions);
  const orderedProperties = getOrderedProperties(schema, uiOptions, value);

  return (
    <React.Fragment>
      {orderedProperties.map((row) => (
        <FormRow
          key={`${props.id}.${typeof row === 'string' ? row : row.join('_')}`}
          {...rest}
          depth={depth + 1}
          row={row}
          schema={schema}
          uiOptions={uiOptions}
          value={value}
        />
      ))}
    </React.Fragment>
  );
};

export { ObjectField };
