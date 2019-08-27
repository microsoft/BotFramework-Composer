import React from 'react';
import { OverflowSet, IconButton, ActionButton, Icon } from 'office-ui-fabric-react';

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
  const { link, isActive, depth, onDelete, onSelect } = props;
  return (
    <ActionButton
      css={navItem(isActive, depth)}
      onClick={() => {
        onSelect(link.id);
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
    </ActionButton>
  );
};
