// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { KeyboardCommandTypes } from '../../constants/KeyboardCommandTypes';
import { locateNearestElement } from './locateElement';
import { Direction } from './type';
export function handleArrowkeyMove(currentElement, selectableElements, command) {
  var element = currentElement;
  var direction;
  var filterAttrs = [];
  switch (command) {
    case KeyboardCommandTypes.Cursor.MoveDown:
      direction = Direction.Down;
      filterAttrs = ['isNode'];
      break;
    case KeyboardCommandTypes.Cursor.MoveUp:
      direction = Direction.Up;
      filterAttrs = ['isNode'];
      break;
    case KeyboardCommandTypes.Cursor.MoveLeft:
      direction = Direction.Left;
      filterAttrs = ['isNode'];
      break;
    case KeyboardCommandTypes.Cursor.MoveRight:
      direction = Direction.Right;
      filterAttrs = ['isNode'];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveDown:
      direction = Direction.Down;
      filterAttrs = ['isNode', 'isEdgeMenu'];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveUp:
      direction = Direction.Up;
      filterAttrs = ['isNode', 'isEdgeMenu'];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveLeft:
      direction = Direction.Left;
      filterAttrs = ['isNode', 'isEdgeMenu'];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveRight:
      direction = Direction.Right;
      filterAttrs = ['isNode', 'isEdgeMenu'];
      break;
    default:
      return element;
  }
  element = locateNearestElement(currentElement, selectableElements, direction, filterAttrs);
  return element;
}
//# sourceMappingURL=arrowMove.js.map
