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

import SchemaField from '../SchemaField';

import { arrayItem } from './styles';

interface ArrayFieldItemProps extends FieldProps {
  allowReorder?: boolean;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  stackArrayItems?: boolean;
  onReorder: (aIdx: number) => void;
  onRemove: () => void;
}

const ArrayFieldItem: React.FC<ArrayFieldItemProps> = props => {
  const {
    allowReorder,
    canMoveUp,
    canMoveDown,
    canRemove,
    onReorder,
    onRemove,
    index,
    depth,
    onBlur,
    stackArrayItems,
    transparentBorder,
    uiOptions,
    value,
    ...rest
  } = props;

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = fn => e => {
    fn(e);
    return true;
  };

  const contextItems: IContextualMenuItem[] = [
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      disabled: !canRemove,
      onClick: fabricMenuItemClickHandler(onRemove),
    },
  ];

  allowReorder &&
    contextItems.unshift(
      {
        key: 'moveUp',
        text: 'Move Up',
        iconProps: { iconName: 'CaretSolidUp' },
        disabled: !canMoveUp,
        onClick: fabricMenuItemClickHandler(() => onReorder(index - 1)),
      },
      {
        key: 'moveDown',
        text: 'Move Down',
        iconProps: { iconName: 'CaretSolidDown' },
        disabled: !canMoveDown,
        onClick: fabricMenuItemClickHandler(() => onReorder(index + 1)),
      }
    );

  const handleBlur = () => {
    if (!value || (typeof value === 'object' && !Object.values(value).some(Boolean))) {
      onRemove();
    }

    if (typeof onBlur === 'function') {
      onBlur(rest.id, value);
    }
  };

  return (
    <div css={arrayItem.container}>
      <div css={arrayItem.field(!!stackArrayItems)}>
        <SchemaField
          {...rest}
          css={arrayItem.schemaFieldOverride}
          depth={depth + 1}
          label={!stackArrayItems ? false : undefined}
          transparentBorder={!stackArrayItems ? transparentBorder : undefined}
          uiOptions={uiOptions}
          value={value}
          onBlur={handleBlur}
        />
      </div>
      <IconButton
        ariaLabel="Item Actions"
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
