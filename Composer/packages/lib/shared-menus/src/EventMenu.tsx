import React from 'react';

import { IconMenu } from './templates/IconMenu';
import { createStepMenu, DialogGroup } from './appschema';

interface EventMenuProps {
  label?: string;
  onClick: (item: string | null) => void;
}

export const EventMenu: React.FC<EventMenuProps> = ({ label, onClick, ...rest }) => {
  return (
    <IconMenu
      iconName="CircleAddition"
      label={label}
      iconStyles={{ color: '#0078D4' }}
      menuItems={createStepMenu([DialogGroup.EVENTS], false, (e, item) => onClick(item ? item.$type : null))}
      {...rest}
    />
  );
};
