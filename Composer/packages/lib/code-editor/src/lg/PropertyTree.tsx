// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Icon, IIconStyles } from 'office-ui-fabric-react/lib/Icon';
import { IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';

import { PropertyItem } from './types';
import { getAllNodes } from './utils';

const DEFAULT_TREE_ITEM_HEIGHT = 36;
const DEFAULT_INDENTATION_PADDING = 16;
const expandIconWidth = 16;

const labelContainerStyle: IStackStyles = {
  root: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: DEFAULT_TREE_ITEM_HEIGHT },
};

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
  userSelect: 'none',
  position: 'relative',
  zIndex: 0,
  cursor: 'pointer',
  '&:hover': {
    '&:before': {
      content: '""',
      position: 'absolute',
      height: DEFAULT_TREE_ITEM_HEIGHT,
      lineHeight: `${DEFAULT_TREE_ITEM_HEIGHT}px`,
      width: '100%',
      left: 0,
      background: NeutralColors.gray40,
      zIndex: -1,
    },
  },
});

const EmptyView = ({ message }: { message: string }) => (
  <Stack
    key="no_results"
    horizontal
    horizontalAlign="center"
    styles={{ root: { height: 32 } }}
    tokens={{ childrenGap: 8 }}
    verticalAlign="center"
  >
    <Icon iconName="SearchIssue" title={message} />
    <span>{message}</span>
  </Stack>
);

const Content = styled(Stack)<{
  width: string;
}>({ flex: 1, overflow: 'hidden' }, (props) => ({
  width: props.width,
}));

type PropertyTreeItemProps = {
  item: PropertyItem;
  level: number;
  onClick: (item: PropertyItem) => void;
  onRenderLabel: (item: PropertyItem) => React.ReactNode;
  expanded?: boolean;
  onToggleExpand?: (itemId: string, expanded: boolean) => void;
};

const PropertyTreeItem = React.memo((props: PropertyTreeItemProps) => {
  const { expanded = false, item, level, onClick, onToggleExpand, onRenderLabel } = props;

  const paddingLeft = level * DEFAULT_INDENTATION_PADDING;

  const click = React.useCallback(() => {
    onClick(item);
  }, [onClick, item]);

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
      data-is-focusable="true"
      style={{ paddingLeft }}
      title={item.id}
      verticalAlign="center"
      onClick={click}
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

type PropertyTreeProps = {
  root: PropertyItem;
  onSelectProperty: (property: string) => void;
  searchQuery?: string;
  emptyMessage: string;
};

export const PropertyTree = (props: PropertyTreeProps) => {
  const { root, onSelectProperty, searchQuery, emptyMessage } = props;
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({ root: true });
  const { nodes, levels, paths } = React.useMemo(
    () => getAllNodes<PropertyItem>(root, { expanded: expanded, skipRoot: true }),
    [root, expanded]
  );
  const { nodes: searchableNodes, paths: searchablePaths } = React.useMemo(
    () => getAllNodes<PropertyItem>(root, { skipRoot: true }),
    [root]
  );

  const searchMode = !!searchQuery;
  const searchItems = React.useMemo(
    () =>
      searchQuery
        ? searchableNodes.filter(
            (n) =>
              n.children.length === 0 && searchablePaths[n.id].toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1
          )
        : [],
    [searchableNodes, searchablePaths, searchQuery]
  );

  const onToggleExpand = React.useCallback(
    (itemId: string, isExpanded: boolean) => {
      setExpanded({ ...expanded, [itemId]: isExpanded });
    },
    [expanded]
  );

  const onClick = React.useCallback(
    (item: PropertyItem) => {
      if (item.children.length) {
        onToggleExpand(item.id, !expanded[item.id]);
      } else {
        const path = paths[item.id];
        onSelectProperty(path);
      }
    },
    [onSelectProperty, expanded, paths]
  );

  const onClickSearchable = React.useCallback(
    (item: PropertyItem) => {
      const path = searchablePaths[item.id];
      onSelectProperty(path);
    },
    [onSelectProperty, searchablePaths]
  );

  const renderLabel = React.useCallback(
    (item: PropertyItem) => {
      const pathNodes = paths[item.id].split('.');
      return (
        <Stack horizontal styles={labelContainerStyle} verticalAlign="center">
          {pathNodes.map((pn, idx) => (
            <Text
              key={`segment-${idx}`}
              styles={{ root: { color: idx === pathNodes.length - 1 ? NeutralColors.black : NeutralColors.gray70 } }}
            >
              {`${pn}${idx === pathNodes.length - 1 && item.children.length === 0 ? '' : '.'}`}
            </Text>
          ))}
        </Stack>
      );
    },
    [paths]
  );

  const renderSearchLabel = React.useCallback(
    (item: PropertyItem) => {
      return (
        <Stack styles={labelContainerStyle} verticalAlign="center">
          <Text>{searchablePaths[item.id]}</Text>
        </Stack>
      );
    },
    [searchablePaths]
  );

  return (
    <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical} role="menu">
      {searchMode ? (
        searchItems.length ? (
          searchItems.map((n) => (
            <PropertyTreeItem
              key={n.id}
              item={n}
              level={0}
              onClick={onClickSearchable}
              onRenderLabel={renderSearchLabel}
            />
          ))
        ) : (
          <EmptyView message={emptyMessage} />
        )
      ) : (
        nodes.map((n) => (
          <PropertyTreeItem
            key={n.id}
            expanded={expanded[n.id]}
            item={n}
            level={levels[n.id] - 1}
            onClick={onClick}
            onRenderLabel={renderLabel}
            onToggleExpand={onToggleExpand}
          />
        ))
      )}
    </FocusZone>
  );
};
