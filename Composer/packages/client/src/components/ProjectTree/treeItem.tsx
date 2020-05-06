// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { moreButton, overflowSet, menuStyle, navItem, itemText, content } from './styles';

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
    <div role="cell" css={itemText(item.depth)} tabIndex={0} onFocus={item.onFocus} onBlur={item.onBlur}>
      <div css={content} tabIndex={-1}>
        {item.depth !== 0 && (
          <Icon
            tabIndex={-1}
            iconName="Flow"
            styles={{
              root: {
                marginRight: '8px',
                outline: 'none',
              },
            }}
          />
        )}
        {item.displayName}
      </div>
    </div>
  );
};

const onRenderOverflowButton = (isRoot: boolean, isActive: boolean) => {
  const showIcon = !isRoot;
  return overflowItems => {
    return showIcon ? (
      <IconButton
        role="cell"
        className="dialog-more-btn"
        data-testid="dialogMoreButton"
        styles={moreButton(isActive)}
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems, styles: menuStyle }}
      />
    ) : null;
  };
};

export const TreeItem: React.FC<ITreeItemProps> = props => {
  const { link, isActive, isSubItemActive, depth, onDelete, onSelect } = props;

  return (
    <div
      role="presentation"
      css={navItem(isActive, !!isSubItemActive)}
      onClick={() => {
        onSelect(link.id);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onSelect(link.id);
        }
      }}
    >
      <OverflowSet
        role="row"
        items={[
          {
            key: link.id,
            depth,
            ...link,
          },
        ]}
        overflowItems={[
          {
            key: 'delete',
            name: 'Delete',
            onClick: () => onDelete(link.id),
          },
        ]}
        css={overflowSet}
        styles={{ item: { flex: 1 } }}
        data-testid={`DialogTreeItem${link.id}`}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot, isActive)}
      />
    </div>
  );
};
