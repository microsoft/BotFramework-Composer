import React, { useContext } from 'react';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared-menus';

import { EdgeAddButtonSize } from '../../constants/ElementSizes';
import { ClipboardContext } from '../../store/ClipboardContext';

import { IconMenu } from './IconMenu';

interface EdgeMenuProps {
  onClick: (item: string | null) => void;
}

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ onClick, ...rest }) => {
  const { clipboardActions } = useContext(ClipboardContext);
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
        iconStyles={{ background: 'white', color: '#005CE6' }}
        iconSize={10}
        menuItems={menuItems}
        label={formatMessage('Add')}
        {...rest}
      />
    </div>
  );
};
