// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FieldProps } from '@bfc/extension';

import { FieldLabel } from '../FieldLabel';

import { openObjectField } from './styles';
import { EditableField } from './EditableField';

const ObjectItem = ({
  name: originalName,
  formData,
  value,
  handleNameChange,
  handleValueChange,
  handleDropPropertyClick,
}) => {
  const [name, setName] = useState<string>(originalName);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const contextItems: IContextualMenuItem[] = [
    {
      iconProps: { iconName: 'Cancel' },
      key: 'remove',
      onClick: handleDropPropertyClick,
      text: 'Remove',
    },
  ];

  const handleBlur = () => {
    if (name !== originalName && Object.keys(formData).includes(name)) {
      setErrorMessage('Keys must be unique');
    } else {
      handleNameChange(name);
      setErrorMessage('');
    }
  };

  return (
    <div css={openObjectField.container}>
      <div css={openObjectField.item}>
        <EditableField
          transparentBorder
          depth={0}
          error={errorMessage}
          id={`${name}.key`}
          name="key"
          placeholder={'Add a new key'}
          schema={{}}
          styles={{
            errorMessage: { display: 'block', paddingTop: 0 },
            root: { margin: '7px 0 7px 0' },
          }}
          uiOptions={{}}
          value={name}
          onBlur={handleBlur}
          onChange={newValue => setName(newValue || '')}
        />
      </div>
      <div css={openObjectField.item}>
        <EditableField
          transparentBorder
          depth={0}
          id={`${name}.value`}
          name="value"
          placeholder={'Add a new value'}
          schema={{}}
          styles={{
            root: { margin: '7px 0 7px 0' },
          }}
          uiOptions={{}}
          value={value}
          onChange={handleValueChange}
        />
      </div>
      <IconButton
        ariaLabel={'Edit Property'}
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: contextItems }}
        styles={{
          root: { margin: '7px 0 7px 0' },
          menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 },
        }}
      />
    </div>
  );
};

export const OpenObjectField: React.FC<FieldProps<{
  [key: string]: any;
}>> = props => {
  const {
    value = {},
    schema: { additionalProperties },
    onChange,
    id,
    label,
    description,
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
      }
    }
  };

  const handleNameChange = (name: string) => (newName: string) => {
    const { [name]: currentValue, ...rest } = value;
    const newFormData = !(newName || currentValue) ? rest : { ...rest, [newName]: currentValue };
    onChange(newFormData);
  };

  const handleValueChange = (name: string) => (_, newValue) => {
    onChange({ ...value, [name]: newValue || '' });
  };

  const handleDropPropertyClick = (name: string) => () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [name]: _, ...newFormData } = value;
    onChange(newFormData);
  };

  return (
    <div className="OpenObjectField">
      <FieldLabel description={description} id={id} label={label} />
      <div css={openObjectField.labelContainer}>
        <div css={openObjectField.label}>
          <FieldLabel id={`${id}.key`} label={'Key'} />
        </div>
        <div css={openObjectField.label}>
          <FieldLabel id={`${id}.value`} label={'Value'} />
        </div>
        <div css={openObjectField.filler} />
      </div>
      {Object.entries(value).map(([name, value], index) => {
        return (
          <ObjectItem
            key={index}
            formData={value}
            handleDropPropertyClick={handleDropPropertyClick(name)}
            handleNameChange={handleNameChange(name)}
            handleValueChange={handleValueChange(name)}
            name={name}
            value={value}
          />
        );
      })}
      {additionalProperties && (
        <div css={openObjectField.container}>
          <div css={openObjectField.item}>
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
          <div css={openObjectField.item}>
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
