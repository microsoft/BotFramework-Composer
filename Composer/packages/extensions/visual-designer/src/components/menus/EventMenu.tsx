import React from 'react';
import { createStepMenu, DialogGroup } from 'shared';

import { IconMenu } from './IconMenu';

interface EventMenuProps {
  label?: string;
  onClick: (item: string | null) => void;
}

export const EventMenu: React.FC<EventMenuProps> = ({ label, onClick, ...rest }): JSX.Element => {
  const eventMenuItems = createStepMenu(
    [DialogGroup.EVENTS],
    false,
    (e, item): any => onClick(item ? item.$type : null)
  );

  return (
    <IconMenu
      iconName="CircleAddition"
      label={label}
      iconStyles={{ color: '#0078D4' }}
      menuItems={eventMenuItems}
      {...rest}
    />
  );
};
