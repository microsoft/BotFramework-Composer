// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { moreButton, overflowSet, moreMenu, navItem, itemText } from './styles';

const onRenderItem = item => {
  return (
    <div css={itemText(item.depth)}>
      {item.depth !== 0 && <Icon iconName="Flow" styles={{ root: { marginRight: '8px' } }} />}
      {item.displayName}
    </div>
  );
};

const onRenderOverflowButton = overflowItems => {
  return (
    <IconButton
      className="dialog-more-btn"
      data-testid="dialogMoreButton"
      styles={moreButton}
      menuIconProps={{ iconName: 'MoreVertical' }}
      menuProps={{ items: overflowItems, styles: { subComponentStyles: { callout: moreMenu } } }}
    />
  );
};

export const TreeItem = props => {
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
        onRenderOverflowButton={link.isRoot ? () => {} : onRenderOverflowButton}
      />
    </div>
  );
};
