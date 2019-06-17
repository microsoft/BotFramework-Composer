import React from 'react';

import { IconMenu } from '../nodes/templates/IconMenu';
import { ObiTypes } from '../../shared/ObiTypes';

export const EventMenu = ({ onClick }) => {
  const eventTypes = [ObiTypes.IntentRule, ObiTypes.UnknownIntentRule, ObiTypes.EventRule];
  const menuItems = eventTypes.map(x => ({
    key: x,
    name: x,
    onClick: () => onClick(x),
  }));
  return <IconMenu iconName="CircleAddition" iconStyles={{ color: '#0078D4' }} menuItems={menuItems} />;
};
