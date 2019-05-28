import React from 'react';

import { IconMenu } from '../nodes/templates/IconMenu';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { EdgeAddButtonSize } from '../../shared/elementSizes';

export const EdgeMenu = ({ id, onEvent }) => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  return (
    <div
      style={{
        width: EdgeAddButtonSize.width,
        height: EdgeAddButtonSize.height,
        borderRadius: '8px',
        backdropFilter: 'white',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <IconMenu
        iconName="Add"
        iconStyles={{ background: 'white', color: '#005CE6', transform: 'scale(0.5)' }}
        menuItems={menuItems}
      />
    </div>
  );
};
