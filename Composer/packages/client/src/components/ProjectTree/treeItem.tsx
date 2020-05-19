// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { overflowSet, menuStyle, navItem, itemText, content } from './styles';

interface ITreeItemProps {
  link: any;
  isActive: boolean;
  isSubItemActive?: boolean;
  depth: number | undefined;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const onRenderItem = (item: IOverflowSetItemProps) => {
  return (
    <div
      css={itemText(item.depth)}
      data-is-focusable
      onBlur={item.onBlur}
      onFocus={item.onFocus}
      role="cell"
      tabIndex={0}
    >
      <div css={content} tabIndex={-1}>
        {item.depth !== 0 && (
          <Icon
            iconName="Flow"
            styles={{
              root: {
                marginRight: '8px',
                outline: 'none',
              },
            }}
            tabIndex={-1}
          />
        )}
        {item.displayName}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (isRoot: boolean, isActive: boolean) => {
  const showIcon = !isRoot;
  return (overflowItems) => {
    return showIcon ? (
      <IconButton
        className="dialog-more-btn"
        data-is-focusable={isActive}
        data-testid="dialogMoreButton"
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems, styles: menuStyle }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
        role="cell"
      />
    ) : null;
  };
};

export const TreeItem: React.FC<ITreeItemProps> = (props) => {
  const { link, isActive, isSubItemActive, depth, onDelete, onSelect } = props;

  return (
    <div
      css={navItem(isActive, !!isSubItemActive)}
      onClick={() => {
        onSelect(link.id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect(link.id);
        }
      }}
      role="presentation"
    >
      <OverflowSet
        css={overflowSet}
        data-testid={`DialogTreeItem${link.id}`}
        doNotContainWithinFocusZone
        items={[
          {
            key: link.id,
            depth,
            ...link,
          },
        ]}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot, isActive)}
        overflowItems={[
          {
            key: 'delete',
            name: 'Delete',
            onClick: () => onDelete(link.id),
          },
        ]}
        role="row"
        //In 8.0 the OverflowSet will no longer be wrapped in a FocusZone
        //remove this at that time
        styles={{ item: { flex: 1 } }}
      />
    </div>
  );
};
