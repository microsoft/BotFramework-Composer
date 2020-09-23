// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FieldProps } from '@bfc/extension-client';

import { getOrderedProperties } from '../../utils';
import { FormRow } from '../FormRow';

import { AdditionalField } from './AdditionalField';

const ObjectField: React.FC<FieldProps<object>> = function ObjectField(props) {
  const { definitions, schema, uiOptions, depth, value, label, onChange, ...rest } = props;

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
      {orderedProperties.map((row) => {
        if (typeof row === 'string' || Array.isArray(row)) {
          return (
            <FormRow
              key={`${props.id}.${typeof row === 'string' ? row : row.join('_')}`}
              {...rest}
              definitions={definitions}
              depth={newDepth}
              row={row}
              schema={schema}
              uiOptions={uiOptions}
              value={value}
              onChange={handleChange}
            />
          );
        } else {
          return (
            <AdditionalField
              key={`${props.id}.${row.name}`}
              id={`${props.id}.${row.name}`}
              {...row}
              definitions={definitions}
              depth={newDepth}
              schema={schema}
              uiOptions={uiOptions}
              value={value}
              onChange={onChange}
            />
          );
        }
      })}
    </React.Fragment>
  );
};

export { ObjectField };
