// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ArrayFieldItem } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { arrayItem, arrayItemField } from './styles';

const ArrayItem: React.FC<ArrayFieldItem> = props => {
  const { hasMoveUp, hasMoveDown, hasRemove, onReorderClick, onDropIndexClick, index } = props;

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = fn => e => {
    fn(e);
    return true;
  };

  const contextItems: IContextualMenuItem[] = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index - 1)),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index + 1)),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      disabled: !hasRemove,
      onClick: fabricMenuItemClickHandler(onDropIndexClick(index)),
    },
  ];

  return (
    <div css={arrayItem}>
      <div css={arrayItemField}>{props.children}</div>
      <IconButton
        menuProps={{ items: contextItems }}
        menuIconProps={{ iconName: 'MoreVertical' }}
        ariaLabel={formatMessage('Item Actions')}
        data-testid="ArrayItemContextMenu"
        styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
      />
    </div>
  );
};

ArrayItem.defaultProps = {
  onReorderClick: () => () => {},
  onDropIndexClick: () => () => {},
};

export default ArrayItem;
