import React from 'react';

import { NodeEventTypes } from '../../constants/NodeEventTypes';

import { IconMenu } from './IconMenu';

export const NodeMenu = ({ id, onEvent }): JSX.Element => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  return <IconMenu iconName="MoreVertical" iconStyles={{ color: '#0078D4' }} menuItems={menuItems} menuWidth={100} />;
};
