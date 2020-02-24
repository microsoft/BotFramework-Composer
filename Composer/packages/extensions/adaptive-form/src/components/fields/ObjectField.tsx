// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { UIOptions, FieldProps } from '@bfc/extension';

import { resolvePropSchema, getOrderedProperties } from '../../utils';
import SchemaField from '../SchemaField';

const ObjectField: React.FC<FieldProps<object>> = function ObjectField(props) {
  const {
    schema,
    uiOptions,
    depth,
    value,
    definitions,
    className,
    id,
    onBlur,
    onFocus,
    rawErrors,
    transparentBorder,
  } = props;

  if (!schema) {
    return null;
  }

  const newDepth = depth + 1;

  const handleChange = (field: string) => (data: any) => {
    const newData = { ...value };

    if (
      typeof data === 'undefined' ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'string' && data.length === 0)
    ) {
      delete newData[field];
    } else {
      newData[field] = data;
    }

    props.onChange(newData);
  };

  const orderedProperties = getOrderedProperties(schema, uiOptions, value);

  return (
    <React.Fragment>
      {orderedProperties
        .map(property => {
          const propSchema = resolvePropSchema(schema, property, definitions);
          if (propSchema) {
            return (
              <SchemaField
                key={`${id}.${property}`}
                className={className}
                definitions={definitions}
                depth={newDepth}
                id={`${id}.${property}`}
                label={props.label === false ? false : undefined}
                name={property}
                rawErrors={rawErrors?.[property]}
                schema={propSchema}
                transparentBorder={transparentBorder}
                uiOptions={(uiOptions.properties?.[property] as UIOptions) ?? {}}
                value={value && value[property]}
                onBlur={onBlur}
                onChange={handleChange(property)}
                onFocus={onFocus}
              />
            );
          }
        })
        .filter(Boolean)}
    </React.Fragment>
  );
};

export { ObjectField };
