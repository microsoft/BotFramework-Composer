import React from 'react';

import { IconMenu } from '../nodes/templates/IconMenu';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { ObiTypes } from '../../shared/ObiTypes';

export const EventMenu = ({ id, onEvent }) => {
  const eventTypes = [ObiTypes.EventRule, ObiTypes.IntentRule, ObiTypes.UnknownIntentRule];
  const menuItems = eventTypes.map(x => ({
    key: x,
    name: x,
    onClick: () => onEvent(NodeEventTypes.Insert, { id, $type: x }),
  }));
  return <IconMenu iconName="CircleAddition" iconStyles={{ color: '#0078D4' }} menuItems={menuItems} />;
};
