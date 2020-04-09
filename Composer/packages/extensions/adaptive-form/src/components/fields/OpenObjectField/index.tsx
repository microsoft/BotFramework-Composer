// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FieldProps } from '@bfc/extension';

import { FieldLabel } from '../../FieldLabel';

import * as styles from './styles';
import { ObjectItem } from './ObjectItem';

const OpenObjectField: React.FC<FieldProps<{
  [key: string]: any;
}>> = props => {
  const {
    value = {},
    schema: { additionalProperties },
    onChange,
    id,
    label,
    description,
    uiOptions,
  } = props;

  const [name, setName] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');

  const handleKeyDown = event => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (name && !Object.keys(value).includes(name)) {
        onChange({ ...value, [name]: newValue });
        setName('');
        setNewValue('');
        // send focus to new item
      }
    }
  };

  const handleNameChange = (name: string) => (newName: string) => {
    const { [name]: currentValue, ...rest } = value;
    const newFormData = !(newName || currentValue) ? rest : { ...rest, [newName]: currentValue };
    onChange(newFormData);
  };

  const handleValueChange = (name: string) => (newValue?: string) => {
    onChange({ ...value, [name]: newValue || '' });
  };

  const handleDropPropertyClick = (name: string) => () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [name]: _, ...newFormData } = value;
    onChange(newFormData);
  };

  return (
    <div className="OpenObjectField">
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} />
      <div css={styles.labelContainer}>
        <div css={styles.label}>
          <FieldLabel id={`${id}.key`} label={'Key'} />
        </div>
        <div css={styles.label}>
          <FieldLabel id={`${id}.value`} label={'Value'} />
        </div>
        <div css={styles.filler} />
      </div>
      {Object.entries(value).map(([name, value], index) => {
        return (
          <ObjectItem
            key={index}
            formData={value}
            onDelete={handleDropPropertyClick(name)}
            onNameChange={handleNameChange(name)}
            onValueChange={handleValueChange(name)}
            name={name}
            value={value}
          />
        );
      })}
      {additionalProperties && (
        <div css={styles.container}>
          <div css={styles.item}>
            <TextField
              autoComplete="off"
              placeholder={'Add a new key'}
              styles={{
                root: { margin: '7px 0 7px 0' },
              }}
              value={name}
              onChange={(_, newValue) => setName(newValue || '')}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div css={styles.item}>
            <TextField
              autoComplete="off"
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
              placeholder={'Add a new value'}
              styles={{
                root: { margin: '7px 0 7px 0' },
              }}
              value={newValue}
              onChange={(_, newValue) => setNewValue(newValue || '')}
              onKeyDown={handleKeyDown}
            />
          </div>
          <IconButton
            ariaLabel={'Edit Property'}
            disabled={true}
            menuIconProps={{ iconName: 'MoreVertical' }}
            styles={{
              menuIcon: { fontSize: FontSizes.size16 },
              root: { margin: '7px 0 7px 0' },
              rootDisabled: {
                backgroundColor: NeutralColors.white,
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export { OpenObjectField };
