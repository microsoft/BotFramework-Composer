/** @jsx jsx */
import { jsx } from '@emotion/core';
import { OverflowSet, CommandBarButton, IconButton } from 'office-ui-fabric-react';

import { moreButton, overflowSet, moreMenu } from './styles';
const onRenderItem = item => {
  if (item.onRender) {
    return item.onRender(item);
  }
  return <CommandBarButton iconProps={{ iconName: item.icon }} menuProps={item.subMenuProps} text={item.name} />;
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
  const { link, render } = props;
  return (
    <OverflowSet
      items={[
        {
          key: 'common',
          onRender: () => {
            return render(link);
          },
        },
      ]}
      overflowItems={[
        {
          key: 'delete',
          name: 'Delete',
          onClick: () => link.onDelete(link.id),
        },
      ]}
      css={overflowSet}
      data-testid={`DialogTreeItem${link.id}`}
      onRenderItem={onRenderItem}
      onRenderOverflowButton={link.hiddenMore ? () => {} : onRenderOverflowButton}
    />
  );
};
