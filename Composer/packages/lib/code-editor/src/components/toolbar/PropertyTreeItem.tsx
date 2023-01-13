// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@fluentui/theme';
import { Icon, IIconStyles } from '@fluentui/react/lib/Icon';
import { Button } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import * as React from 'react';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';

import { PropertyItem } from '../../types';

const DEFAULT_TREE_ITEM_HEIGHT = 36;
const DEFAULT_INDENTATION_PADDING = 16;
const expandIconWidth = 16;

const toggleExpandIconStyle: IIconStyles = {
  root: {
    height: DEFAULT_TREE_ITEM_HEIGHT,
    width: DEFAULT_TREE_ITEM_HEIGHT,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
    transition: 'background 250ms ease',
    selectors: {
      '&:hover, &:focus-within': { background: NeutralColors.gray50 },
      '&:before': {
        content: '""',
      },
    },
  },
};

const Root = styled(Stack)({
  width: '100%',
  height: DEFAULT_TREE_ITEM_HEIGHT,
  border: 'none',
});

const Content = styled(Stack)<{
  width: string;
}>({ flex: 1, overflow: 'hidden' }, (props) => ({
  width: props.width,
}));

type PropertyTreeItemProps = {
  onClick?: (
    ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    item?: IContextualMenuItem
  ) => boolean | void;
  item: PropertyItem;
  level: number;
  onRenderLabel: (item: PropertyItem) => React.ReactNode;
  expanded?: boolean;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
};

export const PropertyTreeItem = React.memo((props: PropertyTreeItemProps) => {
  const { expanded = false, item, level, onToggleExpand, onRenderLabel, ...rest } = props;

  const paddingLeft = level * DEFAULT_INDENTATION_PADDING;

  const toggleExpanded = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation();
      onToggleExpand?.(item.id, !expanded);
    },
    [expanded, onToggleExpand, item]
  );

  const isExpandable = !!item.children?.length && onToggleExpand;

  return (
    <Root
      horizontal
      aria-expanded={isExpandable ? (expanded ? 'true' : 'false') : undefined}
      as={Button}
      className="ms-ContextualMenu-link"
      role="menuitem"
      style={{ paddingLeft }}
      tabIndex={0}
      title={item.name}
      verticalAlign="center"
      {...rest}
    >
      {isExpandable ? (
        <Icon
          iconName={expanded ? 'CaretDownSolid8' : 'CaretRightSolid8'}
          styles={toggleExpandIconStyle}
          onClick={toggleExpanded}
        />
      ) : (
        <div style={{ width: 8, height: 8 }} />
      )}
      <Content
        horizontal
        verticalAlign="center"
        width={`calc(100% - ${paddingLeft + (isExpandable ? expandIconWidth : 0)}px)`}
      >
        {onRenderLabel(item)}
      </Content>
    </Root>
  );
});
