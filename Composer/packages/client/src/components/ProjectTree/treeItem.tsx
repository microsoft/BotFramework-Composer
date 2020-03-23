// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { moreButton, overflowSet, test, navItem, itemText } from './styles';

interface ITreeItemProps {
  link: any;
  isActive: boolean;
  isSubItemActive: boolean;
  depth: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const onRenderItem = (item: IOverflowSetItemProps) => {
  return (
    <div css={itemText(item.depth)}>
      {item.depth !== 0 && <Icon iconName="Flow" styles={{ root: { marginRight: '8px' } }} />}
      {item.displayName}
    </div>
  );
};

const onRenderOverflowButton = (isRoot: boolean) => {
  const showIcon = !isRoot;
  return overflowItems => {
    return showIcon ? (
      <IconButton
        className="dialog-more-btn"
        data-testid="dialogMoreButton"
        styles={moreButton}
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems, styles: test }}
      />
    ) : null;
  };
};

export const TreeItem: React.FC<ITreeItemProps> = props => {
  const { link, isActive, isSubItemActive, depth, onDelete, onSelect } = props;
  return (
    <div
      tabIndex={1}
      css={navItem(isActive, isSubItemActive)}
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
        data-testid={`DialogTreeItem${link.id}`}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={onRenderOverflowButton(link.isRoot)}
      />
    </div>
  );
};
