import React, { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared-menus';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';
import { SelectionContext } from '../../store/SelectionContext';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

const declareElementAttributes = (id: string) => {
  return {
    [AttrNames.SelectableElement]: true,
    [AttrNames.EdgeMenuElement]: true,
    [AttrNames.SelectedId]: `${id}${MenuTypes.EdgeMenu}`,
  };
};
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
      className={classnames({ 'step-renderer-container--selected': nodeSelected })}
      {...declareElementAttributes(id)}
    >
      <IconMenu
        iconName="Add"
        iconStyles={{ background: 'white', color: '#005CE6' }}
        iconSize={10}
        nodeSelected={nodeSelected}
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
