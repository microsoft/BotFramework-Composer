// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useRef } from 'react';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { FieldProps } from '@bfc/extension';
import formatMessage from 'format-message';

import { FieldLabel } from '../../FieldLabel';

import * as styles from './styles';
import { ObjectItem } from './ObjectItem';

const OpenObjectField: React.FC<FieldProps<{
  [key: string]: unknown;
}>> = (props) => {
  const {
    value = {},
    schema: { additionalProperties },
    onChange,
    id,
    label,
    description,
    uiOptions,
    required,
  } = props;

  const [name, setName] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const fieldRef = useRef<ITextField>(null);

  const moreLabel = formatMessage('Edit Property');

  const handleKeyDown = (event) => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (name && !Object.keys(value).includes(name)) {
        onChange({ ...value, [name]: newValue });
        setName('');
        setNewValue('');

        if (fieldRef.current) {
          fieldRef.current.focus();
        }
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

  const keyLabel = formatMessage('Key');
  const valueLabel = formatMessage('Value');

  return (
    <div className="OpenObjectField">
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <div css={styles.labelContainer}>
        <div css={styles.label}>
          <FieldLabel required id={`${id}.key`} label={keyLabel} />
        </div>
        <div css={styles.label}>
          <FieldLabel id={`${id}.value`} label={valueLabel} />
        </div>
        <div css={styles.filler} />
      </div>
      {Object.entries(value).map(([name, itemValue], index) => {
        return (
          <ObjectItem
            key={index}
            formData={value}
            name={name}
            value={itemValue}
            onDelete={handleDropPropertyClick(name)}
            onNameChange={handleNameChange(name)}
            onValueChange={handleValueChange(name)}
          />
        );
      })}
      {additionalProperties && (
        <div css={styles.container}>
          <div css={styles.item}>
            <TextField
              ariaLabel={keyLabel}
              autoComplete="off"
              componentRef={fieldRef}
              placeholder={formatMessage('Add a new key')}
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
              ariaLabel={valueLabel}
              autoComplete="off"
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
              placeholder={formatMessage('Add a new value')}
              styles={{
                root: { margin: '7px 0 7px 0' },
              }}
              value={newValue}
              onChange={(_, newValue) => setNewValue(newValue || '')}
              onKeyDown={handleKeyDown}
            />
          </div>
          <TooltipHost content={moreLabel}>
            <IconButton
              disabled
              ariaLabel={moreLabel}
              menuIconProps={{ iconName: 'MoreVertical' }}
              styles={{
                menuIcon: { fontSize: FontSizes.size16 },
                root: { margin: '7px 0 7px 0' },
                rootDisabled: {
                  backgroundColor: NeutralColors.white,
                },
              }}
            />
          </TooltipHost>
        </div>
      )}
    </div>
  );
};

export { OpenObjectField };
