// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { DEFAULT_TREE_ITEM_HEIGHT } from './constants';

export type PropertyItem = {
  id: string;
  name: string;
  children: PropertyItem[];
};

const DEFAULT_INDENTATION_PADDING = 16;
const expandIconWidth = 16;

const toggleExpandIconStyle: IButtonStyles = {
  root: {
    height: DEFAULT_TREE_ITEM_HEIGHT,
    width: DEFAULT_TREE_ITEM_HEIGHT,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background 250ms ease',
  },
  rootHovered: { backgroundColor: NeutralColors.gray30 },
  rootPressed: { backgroundColor: NeutralColors.gray40 },
  icon: {
    color: NeutralColors.gray160,
    fontSize: 8,
    height: 8,
    width: 8,
    lineHeight: 8,
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
        <IconButton
          ariaLabel={expanded ? formatMessage('Collapse item') : formatMessage('Expand item')}
          iconProps={{ iconName: expanded ? 'CaretDownSolid8' : 'CaretRightSolid8' }}
          styles={toggleExpandIconStyle}
          onClick={toggleExpanded}
        />
      ) : (
        <div style={{ width: 8, height: 8 }} />
      )}
      <Content
        horizontal
        styles={{
          root: {
            transition: 'background 250ms ease',
            selectors: isExpandable
              ? {
                  '&:hover': { backgroundColor: NeutralColors.gray30 },
                  '&:active': { backgroundColor: NeutralColors.gray40 },
                }
              : undefined,
          },
        }}
        verticalAlign="center"
        width={`calc(100% - ${paddingLeft + (isExpandable ? expandIconWidth : 0)}px)`}
      >
        {onRenderLabel(item)}
      </Content>
    </Root>
  );
});
