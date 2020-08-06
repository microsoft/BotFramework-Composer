// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useCallback, useMemo } from 'react';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FieldProps } from '@bfc/extension';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';

import { StringField } from '../StringField';
import SchemaField from '../../SchemaField';

import { container, item, itemContainer } from './styles';

interface ObjectItemProps extends FieldProps {
  name: string;
  formData: object;
  stackedLayout?: boolean;
  onNameChange: (name: string) => void;
  onDelete: () => void;
}

const ObjectItem: React.FC<ObjectItemProps> = ({
  definitions,
  name: originalName,
  formData,
  value,
  stackedLayout,
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
      <div css={itemContainer(stackedLayout)}>
        <div css={item}>
          <StringField
            definitions={definitions}
            depth={0}
            error={errorMessage}
            id={`${name}.key`}
            label={stackedLayout ? formatMessage('Key') : false}
            name="key"
            placeholder={initialName || formatMessage('Add a new key')}
            schema={{}}
            transparentBorder={!stackedLayout}
            uiOptions={{}}
            value={name}
            onBlur={handleBlur}
            onChange={(newValue) => setName(newValue || '')}
          />
        </div>
        <div css={item}>
          <SchemaField
            {...rest}
            definitions={definitions}
            id={`${name}.value`}
            name="value"
            placeholder={placeholder}
            schema={schema}
            transparentBorder={!stackedLayout}
            value={value}
            onChange={onChange}
          />
        </div>
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
