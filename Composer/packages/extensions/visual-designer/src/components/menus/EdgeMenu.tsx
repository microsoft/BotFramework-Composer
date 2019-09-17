import React, { useContext } from 'react';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared-menus';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { MenuTypes } from '../../constants/MenuTypes';
import { SelectionContext } from '../../store/SelectionContext';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, onClick, ...rest }) => {
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.EdgeMenu}`);
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
        outline: nodeSelected ? '1px solid #0078d4' : '',
      }}
    >
      <IconMenu
        data-is-selectable={true}
        data-is-edge-menu={true}
        data-selected-id={`${id}${MenuTypes.EdgeMenu}`}
        iconName="Add"
        iconStyles={{ background: 'white', color: '#005CE6' }}
        iconSize={10}
        menuItems={createStepMenu(
          [
            DialogGroup.RESPONSE,
            DialogGroup.INPUT,
            DialogGroup.BRANCHING,
            DialogGroup.STEP,
            DialogGroup.MEMORY,
            DialogGroup.CODE,
            DialogGroup.LOG,
          ],
          true,
          (e, item) => onClick(item ? item.$type : null)
        )}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
