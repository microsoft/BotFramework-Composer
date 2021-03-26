// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Icon, IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

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
      '&:hover': { background: NeutralColors.gray50 },
      '&:before': {
        content: '""',
      },
    },
  },
};

const Root = styled(Stack)({
  height: DEFAULT_TREE_ITEM_HEIGHT,
});

const Content = styled(Stack)<{
  width: string;
}>({ flex: 1, overflow: 'hidden' }, (props) => ({
  width: props.width,
}));

type PropertyTreeItemProps = {
  item: PropertyItem;
  level: number;
  onRenderLabel: (item: PropertyItem) => React.ReactNode;
  expanded?: boolean;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
};

export const PropertyTreeItem = React.memo((props: PropertyTreeItemProps) => {
  const { expanded = false, item, level, onToggleExpand, onRenderLabel } = props;

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
    <Root horizontal style={{ paddingLeft }} title={item.name} verticalAlign="center">
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
