import React from 'react';
import { OverflowSet, IconButton, ActionButton } from 'office-ui-fabric-react';

import { moreButton, overflowSet, moreMenu, navItem, itemText } from './styles';
const onRenderItem = item => {
  return <div css={itemText}>{item.displayName}</div>;
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
  const { link, activeNode, onDelete, onSelect } = props;
  return (
    <ActionButton
      css={navItem(activeNode === link.id)}
      onClick={() => {
        onSelect(link.id);
      }}
    >
      <OverflowSet
        items={[
          {
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
    </ActionButton>
  );
};
