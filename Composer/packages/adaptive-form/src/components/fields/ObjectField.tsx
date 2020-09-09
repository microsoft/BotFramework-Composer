// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FieldProps } from '@bfc/extension';

import { getOrderedProperties } from '../../utils';
import { FormRow } from '../FormRow';

const ObjectField: React.FC<FieldProps<object>> = function ObjectField(props) {
  const { schema, uiOptions, depth, value, label, ...rest } = props;

  if (!schema) {
    return null;
  }

  const newDepth = depth + 1;

  const handleChange = (field: string) => (data: any) => {
    const newData = { ...value };

    if (typeof data === 'undefined' || (typeof data === 'string' && data.length === 0)) {
      delete newData[field];
    } else {
      newData[field] = data;
    }

    props.onChange(newData);
  };

  const orderedProperties = getOrderedProperties(schema, uiOptions, value);

  return (
    <React.Fragment>
      {orderedProperties.map((row) => (
        <FormRow
          key={`${props.id}.${typeof row === 'string' ? row : row.join('_')}`}
          {...rest}
          depth={newDepth}
          row={row}
          schema={schema}
          uiOptions={uiOptions}
          value={value}
          onChange={handleChange}
        />
      ))}
    </React.Fragment>
  );
};

export { ObjectField };
