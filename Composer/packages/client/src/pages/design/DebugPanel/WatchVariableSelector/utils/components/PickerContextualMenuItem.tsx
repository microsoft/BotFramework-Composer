// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { IContextualMenuItemProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IStackStyles, Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { NeutralColors } from '@uifabric/fluent-theme';

import { PropertyItem, PropertyTreeItem } from './PropertyTreeItem';

const defaultTreeItemHeight = 36;

const labelContainerStyle: IStackStyles = {
  root: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', height: defaultTreeItemHeight },
};

export const GetPickerContextualMenuItem = (query: string, propertyTreeExpanded: Record<string, boolean>) => (
  itemProps: IContextualMenuItemProps
) => {
  const {
    item: { secondaryText: path },
  } = itemProps;

  const { onToggleExpand, level, node } = itemProps.item.data as {
    node: PropertyItem;
    onToggleExpand: (itemId: string, expanded: boolean) => void;
    level: number;
  };

  const renderLabel = () => {
    const pathNodes = (path ?? '').split('.');
    return (
      <Stack horizontal styles={labelContainerStyle} verticalAlign="center">
        {pathNodes.map((pathNode, idx) => (
          <Text
            key={`segment-${idx}`}
            styles={{
              root: {
                color: idx === pathNodes.length - 1 ? NeutralColors.black : NeutralColors.gray70,
              },
            }}
            variant="small"
          >
            {`${pathNode}${idx === pathNodes.length - 1 && node.children.length === 0 ? '' : '.'}`}
          </Text>
        ))}
      </Stack>
    );
  };

  const renderSearchResultLabel = () => (
    <Stack styles={labelContainerStyle} verticalAlign="center">
      <Text variant="small">{path}</Text>
    </Stack>
  );

  return (
    <PropertyTreeItem
      expanded={propertyTreeExpanded[node.id]}
      item={node}
      level={level}
      onRenderLabel={query ? renderSearchResultLabel : renderLabel}
      onToggleExpand={onToggleExpand}
    />
  );
};
