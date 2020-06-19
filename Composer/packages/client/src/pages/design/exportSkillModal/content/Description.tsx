// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useEffect } from 'react';
import AdaptiveForm, { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, JSONSchema7, UIOptions } from '@bfc/extension';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';

import { ContentProps } from '../constants';
import { botNameState } from '../../../../recoilModel/atoms/botState';

const styles = {
  row: css`
    display: flex;
    justify-content: space-between;
    width: 75%;
    margin: -7px 0;
  `,
  field: css`
    flex-basis: 350px;
  `,
};

const InlineLabelField: React.FC<FieldProps> = (props) => {
  const { id, placeholder, rawErrors, value = '', onChange } = props;

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue);
  };

  return (
    <div css={styles.row}>
      <div>
        <FieldLabel {...props} />
      </div>
      <div css={styles.field}>
        <TextField
          errorMessage={rawErrors as string}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export const Description: React.FC<ContentProps> = ({ errors, value, schema, onChange }) => {
  const botName = useRecoilValue(botNameState);
  const { $schema, ...rest } = value;

  const { hidden, properties } = useMemo(
    () =>
      Object.entries(schema?.properties as JSONSchema7).reduce(
        ({ hidden, properties }, [key, property]) => {
          if (property.type === 'object' || (property.type === 'array' && property?.items?.type !== 'string')) {
            return { hidden: [...hidden, key], properties };
          }

          const itemSchema = property?.items as JSONSchema7;
          const serializer =
            itemSchema && itemSchema?.type === 'string'
              ? {
                  get: (value) => (Array.isArray(value) ? value.join(',') : value),
                  set: (value) => (typeof value === 'string' ? value.split(/\s*,\s*/) : value),
                }
              : null;

          return {
            hidden,
            properties: { ...properties, [key]: { field: InlineLabelField, hideError: true, serializer } },
          };
        },
        { hidden: [], properties: {} } as any
      ),
    []
  );

  useEffect(() => {
    if (!value.$id) {
      onChange({ $schema, $id: botName, name: botName, ...rest });
    }
  }, []);

  const required = schema?.required || [];

  const uiOptions: UIOptions = {
    hidden,
    label: false,
    order: [...required, '*'],
    properties,
  };

  return <AdaptiveForm errors={errors} formData={value} schema={schema} uiOptions={uiOptions} onChange={onChange} />;
};
