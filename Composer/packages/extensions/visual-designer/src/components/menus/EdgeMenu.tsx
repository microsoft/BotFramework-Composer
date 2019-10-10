import React, { useContext } from 'react';
import classnames from 'classnames';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared-menus';
import { IContextualMenu } from 'office-ui-fabric-react';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { ClipboardContext } from '../../store/ClipboardContext';
import { SelectionContext } from '../../store/SelectionContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

const buildEdgeMenuItemsFromClipboardContext = (context, onClick): IContextualMenu[] => {
  const { clipboardActions } = context;
  const menuItems = createStepMenu(
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
  );

  if (clipboardActions.length) {
    menuItems.unshift({
      key: 'Paste',
      name: 'Paste',
      style: { color: 'lightblue' },
      onClick: () => onClick('PASTE'),
    });
  }
  return menuItems;
};

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, onClick, ...rest }) => {
  const clipboarcContext = useContext(ClipboardContext);
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.EdgeMenu}`);
  const declareElementAttributes = (id: string) => {
    return {
      [AttrNames.SelectableElement]: true,
      [AttrNames.EdgeMenuElement]: true,
      [AttrNames.SelectedId]: `${id}${MenuTypes.EdgeMenu}`,
    };
  };

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
        menuItems={buildEdgeMenuItemsFromClipboardContext(clipboarcContext, onClick)}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
