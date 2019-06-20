import React from 'react';
import { IconMenu } from './templates/IconMenu';
import { createStepMenu, DialogGroup } from './appschema';

export const EventMenu = ({ onClick }) => {
  return (
    <IconMenu
      iconName="CircleAddition"
      label=""
      iconStyles={{ color: '#0078D4' }}
      menuItems={createStepMenu([DialogGroup.EVENTS], false, (e, item) => onClick(item.$type))}
    />
  );
};
