// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { FieldProps } from '@bfc/extension';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes } from '@uifabric/styling';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import formatMessage from 'format-message';

import SchemaField from '../SchemaField';

import { arrayItem } from './styles';

interface ArrayFieldItemProps extends FieldProps {
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  stackArrayItems?: boolean;
  onReorder: (aIdx: number) => void;
  onRemove: () => void;
}

const ArrayFieldItem: React.FC<ArrayFieldItemProps> = (props) => {
  const {
    canMoveUp,
    canMoveDown,
    canRemove,
    onReorder,
    onRemove,
    index,
    label,
    depth,
    onBlur,
    stackArrayItems,
    transparentBorder,
    uiOptions,
    value,
    className,
    rawErrors,
    ...rest
  } = props;

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = (fn) => (e) => {
    fn(e);
    return true;
  };

  const contextItems: IContextualMenuItem[] = [
    {
      key: 'moveUp',
      text: formatMessage('Move Up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !canMoveUp,
      onClick: fabricMenuItemClickHandler(() => onReorder(index - 1)),
    },
    {
      key: 'moveDown',
      text: formatMessage('Move Down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !canMoveDown,
      onClick: fabricMenuItemClickHandler(() => onReorder(index + 1)),
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      disabled: !canRemove,
      onClick: fabricMenuItemClickHandler(onRemove),
    },
  ];

  const handleBlur = () => {
    if (!value || (typeof value === 'object' && !Object.values(value).some(Boolean))) {
      onRemove();
    }

    if (typeof onBlur === 'function') {
      onBlur(rest.id, value);
    }
  };

  return (
    <div className={className} css={arrayItem.container} data-testid="ArrayFieldItem">
      <div css={arrayItem.field}>
        <SchemaField
          {...rest}
          css={arrayItem.schemaFieldOverride(!!stackArrayItems)}
          depth={depth + 1}
          label={!stackArrayItems || label === false ? false : undefined}
          rawErrors={typeof rawErrors === 'object' ? rawErrors[index] : rawErrors}
          transparentBorder={!stackArrayItems ? transparentBorder : undefined}
          uiOptions={uiOptions}
          value={value}
          onBlur={handleBlur}
        />
      </div>
      <IconButton
        ariaLabel={formatMessage('Item Actions')}
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: contextItems }}
        styles={{
          menuIcon: { color: NeutralColors.black, fontSize: FontSizes.medium },
        }}
      />
    </div>
  );
};

export { ArrayFieldItem };
