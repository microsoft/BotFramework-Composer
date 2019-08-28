import { DialogGroup } from 'shared-menus';

import { NodeColors } from '../constants/ElementColors';

export function getElementColor(type) {
  if (NodeColors[type]) {
    return NodeColors[type];
  } else {
    return NodeColors[DialogGroup.STEP];
  }
}
