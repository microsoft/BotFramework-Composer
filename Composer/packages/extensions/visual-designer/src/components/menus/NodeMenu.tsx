import React, { useContext } from 'react';

import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { MenuTypes } from '../../constants/MenuTypes';
import { SelectionContext } from '../../store/SelectionContext';

import { IconMenu } from './IconMenu';

export const NodeMenu = ({ id, onEvent }): JSX.Element => {
  const menuItems = [
    {
      key: 'delete',
      name: 'Delete',
      onClick: () => onEvent(NodeEventTypes.Delete, { id }),
    },
  ];
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.NodeMenu}`);
  return (
    <div
      style={{
        border: nodeSelected ? '1px solid #0078d4' : '',
      }}
    >
      <IconMenu
        iconName="MoreVertical"
        iconStyles={{ color: '#0078D4' }}
        menuItems={menuItems}
        menuWidth={100}
        data-is-selectable={true}
        data-selected-id={`${id}${MenuTypes.NodeMenu}`}
      />
    </div>
  );
};
