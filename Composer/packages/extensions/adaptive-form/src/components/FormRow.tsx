// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, UIOptions } from '@bfc/extension';

import { resolvePropSchema } from '../utils';

import SchemaField from './SchemaField';

interface FormRowProps extends Omit<FieldProps, 'onChange'> {
  onChange: (field: string) => (data: any) => void;
  row: string | [string, string];
}

const FormRow: React.FC<FormRowProps> = ({
  id,
  depth,
  schema,
  row,
  definitions,
  value,
  uiOptions,
  transparentBorder,
  className,
  label,
  rawErrors,
  onBlur,
  onFocus,
  onChange,
}) => {
  if (Array.isArray(row)) {
    return <>Multi field row</>;
  }
  const propSchema = resolvePropSchema(schema, row, definitions);

  if (propSchema) {
    return (
      <SchemaField
        key={`${id}.${row}`}
        className={className}
        definitions={definitions}
        depth={depth}
        id={`${id}.${row}`}
        label={label === false ? false : undefined}
        name={row}
        rawErrors={rawErrors?.[row]}
        schema={propSchema}
        transparentBorder={transparentBorder}
        uiOptions={(uiOptions.properties?.[row] as UIOptions) ?? {}}
        value={value && value[row]}
        onBlur={onBlur}
        onChange={onChange(row)}
        onFocus={onFocus}
      />
    );
  }

  return <>Form Row</>;
};

export { FormRow };
