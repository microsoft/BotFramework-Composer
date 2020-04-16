// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { moreButton, overflowSet, menuStyle, navItem, itemText } from './styles';

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
    <div css={itemText(item.depth)} role="cell">
      {item.depth !== 0 && <Icon iconName="Flow" styles={{ root: { marginRight: '8px' } }} />}
      {item.displayName}
    </div>
  );
};

const onRenderOverflowButton = (isRoot: boolean) => {
  const showIcon = !isRoot;
  return (overflowItems) => {
    return showIcon ? (
      <IconButton
        className="dialog-more-btn"
        data-testid="dialogMoreButton"
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems, styles: menuStyle }}
        role="cell"
        styles={moreButton}
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
      tabIndex={1}
    >
      <OverflowSet
        css={overflowSet}
        data-testid={`DialogTreeItem${link.id}`}
        items={[
          {
            key: link.id,
            depth,
            ...link,
          },
        ]}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot)}
        overflowItems={[
          {
            key: 'delete',
            name: 'Delete',
            onClick: () => onDelete(link.id),
          },
        ]}
        role="row"
      />
    </div>
  );
};
