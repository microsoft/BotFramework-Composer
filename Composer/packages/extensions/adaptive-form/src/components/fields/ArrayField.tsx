// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors, NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { FieldProps } from '@bfc/extension';
import formatMessage from 'format-message';

import { getArrayItemProps } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { arrayField } from './styles';
import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArrayField: React.FC<FieldProps<any[]>> = props => {
  const { value: items = [], onChange, schema, label, description, id, rawErrors = [], uiOptions } = props;
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

  if (!itemSchema || itemSchema === true) {
    return <UnsupportedField {...props} />;
  }

  return (
    <div>
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} />
      <div>
        {items.map((element, idx) => (
          <ArrayFieldItem
            {...props}
            transparentBorder
            key={idx}
            label={false}
            rawErrors={rawErrors[idx]}
            error={rawErrors[idx]}
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
            ariaLabel={formatMessage('New value')}
            styles={{ root: { width: '100%' } }}
          />
          <IconButton
            disabled
            menuIconProps={{ iconName: 'MoreVertical' }}
            ariaLabel={formatMessage('Item Actions')}
            styles={{
              menuIcon: {
                backgroundColor: NeutralColors.white,
                color: NeutralColors.gray130,
                fontSize: FontSizes.size16,
              },
              rootDisabled: {
                backgroundColor: NeutralColors.white,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { ArrayField };
