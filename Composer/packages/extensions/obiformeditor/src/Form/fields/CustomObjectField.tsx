// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState } from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { BaseField } from './BaseField';
import { customObjectFieldContainer, customObjectFieldItem, customObjectFieldLabel } from './styles';
import { EditableField } from './EditableField';

const ObjectItem = ({ name: originalName, value, handleChangeName, handleChangeValue, handleDropPropertyClick }) => {
  const [name, setName] = useState<string>(originalName);

  const contextItems: IContextualMenuItem[] = [
    {
      iconProps: { iconName: 'Cancel' },
      key: 'remove',
      onClick: handleDropPropertyClick,
      text: formatMessage('Remove'),
    },
  ];

  return (
    <div css={customObjectFieldContainer}>
      <div css={customObjectFieldItem}>
        <EditableField
          autoComplete="off"
          onBlur={() => handleChangeName(name)}
          onChange={(_, newValue) => setName(newValue || '')}
          options={{ transparentBorder: true }}
          placeholder={formatMessage('Add a new key')}
          value={name}
          styles={{
            root: { margin: '7px 0 7px 0' },
          }}
        />
      </div>
      <div css={customObjectFieldItem}>
        <EditableField
          autoComplete="off"
          onChange={handleChangeValue}
          options={{ transparentBorder: true }}
          placeholder={formatMessage('Add a new value')}
          value={value}
          styles={{
            root: { margin: '7px 0 7px 0' },
          }}
        />
      </div>
      <IconButton
        ariaLabel={formatMessage('Edit Property')}
        menuProps={{ items: contextItems }}
        menuIconProps={{ iconName: 'MoreVertical' }}
        styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
      />
    </div>
  );
};

export const CustomObjectField: React.FC<FieldProps> = props => {
  const {
    formData = {},
    schema: { additionalProperties },
    onChange,
  } = props;

  const [name, setName] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const handleKeyDown = useCallback(
    event => {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();

        if (name && !Object.keys(formData).includes(name)) {
          onChange({ ...formData, [name]: value });
          setName('');
          setValue('');
        }
      }
    },
    [onChange, name, setValue, value]
  );

  const handleChangeName = name => newName => {
    const { [name]: value, ...rest } = formData;
    const newFormData = !(newName || value) ? rest : { ...rest, [newName]: value };
    onChange(newFormData);
  };
  const handleChangeValue = name => (_, newValue) => onChange({ ...formData, [name]: newValue || '' });
  const handleDropPropertyClick = name => () => {
    const { [name]: _, ...newFormData } = formData;
    onChange(newFormData);
  };

  return (
    <BaseField {...props} className="JsonField">
      <div css={customObjectFieldContainer}>
        <div css={[customObjectFieldItem, customObjectFieldLabel]}>{formatMessage('Key')}</div>
        <div css={[customObjectFieldItem, customObjectFieldLabel]}>{formatMessage('Value')}</div>
      </div>
      {Object.entries(formData).map(([name, value], index) => {
        return (
          <ObjectItem
            key={index}
            name={name}
            value={value}
            handleChangeName={handleChangeName(name)}
            handleChangeValue={handleChangeValue(name)}
            handleDropPropertyClick={handleDropPropertyClick(name)}
          />
        );
      })}
      {additionalProperties && (
        <div css={customObjectFieldContainer}>
          <div css={customObjectFieldItem}>
            <TextField
              autoComplete="off"
              onChange={(_, newValue) => setName(newValue || '')}
              onKeyDown={handleKeyDown}
              placeholder={formatMessage('Add a new key')}
              value={name}
              styles={{
                root: { margin: '7px 0 7px 0' },
              }}
            />
          </div>
          <div css={customObjectFieldItem}>
            <TextField
              autoComplete="off"
              onChange={(_, newValue) => setValue(newValue || '')}
              onKeyDown={handleKeyDown}
              placeholder={formatMessage('Add a new value')}
              value={value}
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
              styles={{
                root: { margin: '7px 0 7px 0' },
              }}
            />
          </div>
          <IconButton
            ariaLabel={formatMessage('Edit Property')}
            disabled={true}
            menuIconProps={{ iconName: 'MoreVertical' }}
            styles={{
              menuIcon: { fontSize: FontSizes.size16 },
              rootDisabled: {
                backgroundColor: NeutralColors.white,
              },
            }}
          />
        </div>
      )}
    </BaseField>
  );
};
