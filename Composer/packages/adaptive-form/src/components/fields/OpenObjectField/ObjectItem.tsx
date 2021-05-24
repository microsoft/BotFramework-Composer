// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useCallback, useMemo } from 'react';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FieldProps } from '@bfc/extension-client';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';

import { StringField } from '../StringField';
import { SchemaField } from '../../SchemaField';
import { WithTypeIcons } from '../../WithTypeIcons';

import { container, item } from './styles';

const StringFieldWithIcon = WithTypeIcons(StringField);
interface ObjectItemProps extends FieldProps {
  name: string;
  formData: object;
  onNameChange: (name: string) => void;
  onDelete: () => void;
}

const ObjectItem: React.FC<ObjectItemProps> = ({
  definitions,
  name: originalName,
  formData,
  value,
  schema,
  onChange,
  onNameChange,
  onDelete,
  ...rest
}) => {
  const initialName = useMemo(() => originalName, []);
  const initialValue = useMemo(() => value, []);
  const [name, setName] = useState<string>(originalName);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const contextItems: IContextualMenuItem[] = [
    {
      iconProps: { iconName: 'Cancel' },
      key: 'remove',
      onClick: onDelete,
      text: 'Remove',
    },
  ];

  const moreLabel = formatMessage('Edit Property');

  const handleBlur = useCallback(() => {
    if (!name || name === '') {
      setErrorMessage(formatMessage('Key cannot be blank'));
    } else if (name !== originalName && Object.keys(formData).includes(name)) {
      setErrorMessage(formatMessage('Keys must be unique'));
    } else {
      onNameChange(name);
      setErrorMessage('');
    }
  }, [name, formData]);

  const placeholder =
    schema.type === 'string' || !schema.type ? initialValue || formatMessage('Add a new value') : undefined;

  return (
    <div css={container} data-testid="ObjectItem">
      <div css={item}>
        <StringFieldWithIcon
          definitions={definitions}
          error={errorMessage}
          id={`${name}.key`}
          label={formatMessage('Key')}
          name="key"
          placeholder={initialName || formatMessage('Add a new key')}
          schema={{ type: 'string' }}
          uiOptions={{}}
          value={name}
          onBlur={handleBlur}
          onChange={(newValue) => setName(newValue || '')}
        />
        <SchemaField
          {...rest}
          definitions={definitions}
          id={`${name}.value`}
          label={formatMessage('Value')}
          name="value"
          placeholder={placeholder}
          schema={schema}
          value={value}
          onChange={onChange}
        />
      </div>
      <TooltipHost content={moreLabel}>
        <IconButton
          ariaLabel={moreLabel}
          data-testid="ObjectItemActions"
          menuIconProps={{ iconName: 'MoreVertical' }}
          menuProps={{ items: contextItems }}
          styles={{
            root: { margin: '7px 0 7px 0' },
            menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 },
          }}
        />
      </TooltipHost>
    </div>
  );
};

export { ObjectItem };
