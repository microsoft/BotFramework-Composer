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
  return elementList.filter(el => {
    const candidateRect = el.bounds;
    return isParentRect(rect, candidateRect);
  });
}

function findSelectableParent(element: SelectorElement, elementList: SelectorElement[]) {
  const rect = element.bounds;
  return elementList.find(el => {
    const candidateRect = el.bounds;
    return isParentRect(candidateRect, rect);
  });
}

export function handleTabMove(currentElement: SelectorElement, selectableElements: SelectorElement[], command: string) {
  let nextElement: SelectorElement;
  const selectableChildren = findSelectableChildren(currentElement, selectableElements);
  const selectableParent = findSelectableParent(currentElement, selectableElements);
  const findElementWithSuffix = suffix => {
    return selectableElements.find(element => element.selectedId === `${selectableParent?.selectedId}${suffix}`);
  };
  if (command === KeyboardCommandTypes.Cursor.MoveNext) {
    if (selectableChildren.length > 0) {
      // Tab to inner selectable element.
      nextElement = selectableChildren[0];
    } else {
      const hasInlineLinkElement = currentElement.selectedId.endsWith('dot') && findElementWithSuffix('link');
      if (hasInlineLinkElement) {
        nextElement = findElementWithSuffix('link') || currentElement;
      } else {
        // Perform like presssing down arrow key.
        nextElement = locateNearestElement(currentElement, selectableElements, Direction.Down, [
          'isNode',
          'isEdgeMenu',
        ]);
      }
    }
  } else if (command === KeyboardCommandTypes.Cursor.MovePrevious) {
    if (selectableParent) {
      // Tab to parent.
      if (currentElement.isInlineLinkElement) {
        nextElement = findElementWithSuffix('dot') || selectableParent;
      } else {
        nextElement = selectableParent;
      }
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
