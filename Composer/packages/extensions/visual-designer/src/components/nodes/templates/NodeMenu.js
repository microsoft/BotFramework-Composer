import React from 'react';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';

const MoreMenuItems = [
  {
    key: 'delete',
    name: 'Delete',
    onClick: () => onEvent(NodeEventTypes.Delete),
  },
];
const AddMenuItems = [];

const NodeMenuTemplate = ({ type, onEvent }) => {
  const iconName = type === 'More' ? 'CirclePlus' : 'CirclePlus';
  const overflowItems = type === 'More' ? MoreMenuItems : AddMenuItems;

  const _onRenderItem = item => {
    return (
      <Link styles={{ root: { marginRight: 10 } }} onClick={item.onClick}>
        {item.name}
      </Link>
    );
  };

  const _onRenderOverflowButton = overflowItems => {
    const buttonStyles = {
      root: {
        minWidth: 0,
        padding: '0 4px',
        alignSelf: 'stretch',
        height: 'auto',
        color: 'white',
      },
    };
    return (
      <IconButton
        styles={buttonStyles}
        menuIconProps={{ iconName }}
        menuProps={{ items: overflowItems, calloutProps: { calloutMaxWidth: 100 } }}
      />
    );
  };

  return (
    <OverflowSet
      styles={{ position: 'absolute', top: 0 }}
      vertical
      overflowItems={overflowItems}
      onRenderOverflowButton={_onRenderOverflowButton}
      onRenderItem={_onRenderItem}
    />
  );
};

export const NodeMenu = ({ id, type, onEvent }) => <NodeMenuTemplate type={type} onEvent={e => onEvent(e, { id })} />;

NodeMenu.defaultProps = {
  onEvent: () => {},
  type: 'More',
};
