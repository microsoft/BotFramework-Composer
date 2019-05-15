import React from 'react';
import { OverflowSet, IconButton, Link } from 'office-ui-fabric-react';

import { NodeEventTypes } from '../../../shared/NodeEventTypes';

const NodeMenuTemplate = ({ onEvent }) => {
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
      <IconButton styles={buttonStyles} menuIconProps={{ iconName: 'More' }} menuProps={{ items: overflowItems }} />
    );
  };

  return (
    <OverflowSet
      styles={{ position: 'absolute', top: 0 }}
      vertical
      overflowItems={[
        {
          key: 'delete',
          name: 'Delete Node',
          onClick: () => onEvent(NodeEventTypes.Delete),
        },
      ]}
      onRenderOverflowButton={_onRenderOverflowButton}
      onRenderItem={_onRenderItem}
    />
  );
};

export const NodeMenu = ({ id, onEvent }) => <NodeMenuTemplate onEvent={e => onEvent(e, { id })} />;

NodeMenu.defaultProps = {
  onEvent: () => {},
};
