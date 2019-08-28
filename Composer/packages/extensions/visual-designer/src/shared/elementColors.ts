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
