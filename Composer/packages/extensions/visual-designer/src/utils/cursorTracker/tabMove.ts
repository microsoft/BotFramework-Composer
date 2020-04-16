// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { KeyboardCommandTypes } from '../../constants/KeyboardCommandTypes';

import { SelectorElement, Direction } from './type';
import { locateNearestElement } from './locateElement';

function isParentRect(parentRect, childRect) {
  return (
    parentRect.left < childRect.left &&
    parentRect.right >= childRect.right &&
    parentRect.top < childRect.top &&
    parentRect.bottom > childRect.bottom
  );
}

function findSelectableChildren(element: SelectorElement, elementList: SelectorElement[]) {
  const rect = element.bounds;
  return elementList.filter((el) => {
    const candidateRect = el.bounds;
    return isParentRect(rect, candidateRect);
  });
}

function findSelectableParent(element: SelectorElement, elementList: SelectorElement[]) {
  const rect = element.bounds;
  return elementList.find((el) => {
    const candidateRect = el.bounds;
    return isParentRect(candidateRect, rect);
  });
}

export function handleTabMove(currentElement: SelectorElement, selectableElements: SelectorElement[], command: string) {
  let nextElement: SelectorElement;
  if (command === KeyboardCommandTypes.Cursor.MoveNext) {
    const selectableChildren = findSelectableChildren(currentElement, selectableElements);
    if (selectableChildren.length > 0) {
      // Tab to inner selectable element.
      nextElement = selectableChildren[0];
    } else {
      // Perform like presssing down arrow key.
      nextElement = locateNearestElement(currentElement, selectableElements, Direction.Down, ['isNode', 'isEdgeMenu']);
    }
  } else if (command === KeyboardCommandTypes.Cursor.MovePrevious) {
    const selectableParent = findSelectableParent(currentElement, selectableElements);
    if (selectableParent) {
      // Tab to parent.
      nextElement = selectableParent;
    } else {
      // Perform like pressing up arrow key.
      nextElement = locateNearestElement(currentElement, selectableElements, Direction.Up, ['isNode', 'isEdgeMenu']);
      // If prev element has children, tab to the last child before the element itself.
      const selectableChildInNext = findSelectableChildren(nextElement, selectableElements);
      if (selectableChildInNext.length > 0) {
        nextElement = selectableChildInNext[selectableChildInNext.length - 1];
      }
    }
  } else {
    // By default, stay focus on the origin element.
    nextElement = currentElement;
  }

  return nextElement;
}
