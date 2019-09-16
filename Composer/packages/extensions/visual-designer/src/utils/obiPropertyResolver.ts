import { DialogGroup, getDialogGroupByType } from 'shared-menus';

import { NodeColors } from '../constants/ElementColors';

export function getElementColor($type) {
  const nodeGroup = getDialogGroupByType($type);

  if (NodeColors[nodeGroup]) {
    return NodeColors[nodeGroup];
  } else {
    return NodeColors[DialogGroup.STEP];
  }
}

export enum ElementIcon {
  MessageBot = 'MessageBot',
  User = 'User',
  Friend = 'Friend',
  Play = 'Play',
  Flow = 'Flow',
  None = 'None',
}

export function getElementIcon($type): ElementIcon {
  const dialgGroup = getDialogGroupByType($type) as string;
  return dialgGroup === 'Response' ? ElementIcon.MessageBot : ElementIcon.None;
}
