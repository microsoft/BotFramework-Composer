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

import { getArrayItemProps, useArrayItems } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { arrayField } from './styles';
import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArrayField: React.FC<FieldProps<any[]>> = (props) => {
  const { value = [], onChange, schema, label, description, id, rawErrors = [], uiOptions, className, ...rest } = props;
  const [newValue, setNewValue] = useState<string>();
  const { arrayItems, handleChange, addItem } = useArrayItems(value, onChange);

  const handleNewChange = (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) =>
    setNewValue(newValue || '');

  const handleKeyDown = (event) => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (newValue) {
        addItem(newValue);
        setNewValue('');
      }
    }
  };

  const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;

  if (!itemSchema || itemSchema === true) {
    return <UnsupportedField {...props} />;
  }

  return (
    <div className={className}>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} />
      <div>
        {arrayItems.map((element, idx) => (
          <ArrayFieldItem
            {...rest}
            error={rawErrors[idx]}
            id={id}
            key={element.id}
            label={false}
            rawErrors={rawErrors[idx]}
            schema={itemSchema}
            transparentBorder
            uiOptions={uiOptions}
            value={element.value}
            {...getArrayItemProps(arrayItems, idx, handleChange)}
          />
        ))}
      </div>
      <div css={arrayField.inputFieldContainer}>
        <div css={arrayField.field}>
          <TextField
            ariaLabel={formatMessage('New value')}
            data-testid="string-array-text-input"
            iconProps={{
              iconName: 'ReturnKey',
              style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
            }}
            onChange={handleNewChange}
            onKeyDown={handleKeyDown}
            styles={{ root: { width: '100%' } }}
            value={newValue}
          />
          <IconButton
            ariaLabel={formatMessage('Item Actions')}
            disabled
            menuIconProps={{ iconName: 'MoreVertical' }}
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
