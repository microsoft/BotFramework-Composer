// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { KeyboardCommandTypes } from '../../constants/KeyboardCommandTypes';

import { locateNearestElement } from './locateElement';
import { SelectorElement, Direction } from './type';

export function handleArrowkeyMove(
  currentElement: SelectorElement,
  selectableElements: SelectorElement[],
  command: string
) {
  let element: SelectorElement = currentElement;
  let direction: Direction;
  let filterAttrs: string[] = [];

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
