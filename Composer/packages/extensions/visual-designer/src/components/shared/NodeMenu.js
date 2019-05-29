import React from 'react';

import { IconMenu } from '../nodes/templates/IconMenu';
import { NodeEventTypes } from '../../shared/NodeEventTypes';

export const NodeMenu = ({ id, onEvent }) => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  return <IconMenu iconName="More" menuItems={menuItems} menuWidth={100} />;
};
