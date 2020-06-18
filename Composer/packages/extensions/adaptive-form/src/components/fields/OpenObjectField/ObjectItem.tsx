// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useCallback, useMemo } from 'react';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';

import { EditableField } from '../EditableField';

import { container, item } from './styles';

interface ObjectItemProps {
  name: string;
  formData: object;
  value: unknown;
  onNameChange: (name: string) => void;
  onValueChange: (value?: string) => void;
  onDelete: () => void;
}

const ObjectItem: React.FC<ObjectItemProps> = ({
  name: originalName,
  formData,
  value,
  onNameChange,
  onValueChange,
  onDelete,
}) => {
  const initialName = useMemo(() => originalName, []);
  const initialValue = useMemo(() => value as string, []);
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

  return (
    <div css={container} data-testid="ObjectItem">
      <div css={item}>
        <EditableField
          transparentBorder
          ariaLabel={formatMessage('key')}
          depth={0}
          error={errorMessage}
          id={`${name}.key`}
          name="key"
          placeholder={initialName || formatMessage('Add a new key')}
          schema={{}}
          styles={{
            errorMessage: { display: 'block', paddingTop: 0 },
            root: { margin: '7px 0' },
          }}
          uiOptions={{}}
          value={name}
          onBlur={handleBlur}
          onChange={(newValue) => setName(newValue || '')}
        />
      </div>
      <div css={item}>
        <EditableField
          transparentBorder
          ariaLabel={formatMessage('value')}
          depth={0}
          id={`${name}.value`}
          name="value"
          placeholder={initialValue || formatMessage('Add a new value')}
          schema={{}}
          styles={{
            root: { margin: '7px 0' },
          }}
          uiOptions={{}}
          value={value}
          onChange={onValueChange}
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
