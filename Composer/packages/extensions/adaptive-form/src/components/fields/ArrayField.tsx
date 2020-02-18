// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { SharedColors } from '@uifabric/fluent-theme';
import { FieldProps } from '@bfc/extension';

import { getArrayItemProps } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { arrayField } from './styles';
import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArrayField: React.FC<FieldProps<any[]>> = props => {
  const { value: items = [], onChange, schema, label, description, id, rawErrors = [] } = props;
  const [newValue, setNewValue] = useState<string>();

  const handleNewChange = (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) =>
    setNewValue(newValue || '');

  const handleKeyDown = event => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (newValue) {
        onChange([...items, newValue]);
        setNewValue('');
      }
    }
  };

  const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;

  if (!itemSchema) {
    return <UnsupportedField {...props} />;
  }

  return (
    <div>
      <FieldLabel description={description} id={id} label={label} />
      <div>
        {items.map((element, idx) => (
          <ArrayFieldItem
            {...props}
            key={idx}
            label={false}
            rawErrors={rawErrors[idx]}
            schema={itemSchema}
            value={element}
            {...getArrayItemProps(items, idx, onChange)}
          />
        ))}
      </div>
      <div css={arrayField.inputFieldContainer}>
        <div css={arrayField.field}>
          <TextField
            data-testid="string-array-text-input"
            iconProps={{
              iconName: 'ReturnKey',
              style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
            }}
            value={newValue}
            onChange={handleNewChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export { ArrayField };
