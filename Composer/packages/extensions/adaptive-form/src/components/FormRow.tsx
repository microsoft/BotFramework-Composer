// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, UIOptions } from '@bfc/extension';

import { resolvePropSchema } from '../utils';

import SchemaField from './SchemaField';

interface FormRowProps extends Omit<FieldProps, 'onChange'> {
  onChange: (field: string) => (data: any) => void;
  row: string | [string, string];
}

const formRow = {
  row: css`
    display: flex;
    margin: 10px 18px;
    label: FormRowContainer;
  `,
  property: css`
    flex: 1;
    margin: 0;

    & + & {
      margin-left: 16px;
    }
  `,
};

const FormRow: React.FC<FormRowProps> = props => {
  const {
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
  } = props;

  if (Array.isArray(row)) {
    return (
      <div css={formRow.row}>
        {row.map(property => (
          <SchemaField
            key={`${id}.${property}`}
            css={formRow.property}
            className={className}
            definitions={definitions}
            depth={depth}
            id={`${id}.${property}`}
            label={label === false ? false : undefined}
            name={property}
            rawErrors={rawErrors?.[property]}
            schema={resolvePropSchema(schema, property, definitions) || {}}
            transparentBorder={transparentBorder}
            uiOptions={(uiOptions.properties?.[property] as UIOptions) ?? {}}
            value={value && value[property]}
            onBlur={onBlur}
            onChange={onChange(property)}
            onFocus={onFocus}
          />
        ))}
      </div>
    );
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

  return null;
};

export { FormRow };
