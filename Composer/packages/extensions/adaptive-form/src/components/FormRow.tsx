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

    label: FormRowProperty;
  `,
  full: css`
    flex: 1;

    label: FormRow;
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
    announce,
  } = props;

  const { required = [] } = schema;

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
            required={required.includes(property)}
            schema={resolvePropSchema(schema, property, definitions) || {}}
            transparentBorder={transparentBorder}
            uiOptions={(uiOptions.properties?.[property] as UIOptions) ?? {}}
            value={value && value[property]}
            onBlur={onBlur}
            onChange={onChange(property)}
            onFocus={onFocus}
            announce={announce}
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
        css={formRow.full}
        className={className}
        definitions={definitions}
        depth={depth}
        id={`${id}.${row}`}
        label={label === false ? false : undefined}
        name={row}
        rawErrors={rawErrors?.[row]}
        required={required.includes(row)}
        schema={propSchema}
        transparentBorder={transparentBorder}
        uiOptions={(uiOptions.properties?.[row] as UIOptions) ?? {}}
        value={value && value[row]}
        onBlur={onBlur}
        onChange={onChange(row)}
        onFocus={onFocus}
        announce={announce}
      />
    );
  }

  return null;
};

export { FormRow };
