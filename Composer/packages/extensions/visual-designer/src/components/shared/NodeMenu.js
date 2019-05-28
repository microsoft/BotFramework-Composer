import React from 'react';

import { IconMenu } from '../nodes/templates/IconMenu';
import { NodeEventTypes } from '../../shared/NodeEventTypes';

export const NodeMenu = ({ id, onEvent }) => {
  const overflowItems = [
    {
      key: 'delete',
      name: 'Delete',
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  return <IconMenu iconName="More" overflowItems={overflowItems} />;
};
