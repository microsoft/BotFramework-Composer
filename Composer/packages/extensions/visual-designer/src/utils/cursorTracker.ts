// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PromptTab } from 'shared';

import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { InitNodeSize } from '../constants/ElementSizes';
import { AttrNames, AbstractSelectorElement } from '../constants/ElementAttributes';

enum BoundRect {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

enum Axle {
  X,
  Y,
}

/**
 *
 * @param currentElement current element
 * @param elements all elements have AttrNames.SelectableElements attribute
 * @param boundRectKey key to calculate shortest distance
 * @param assistAxle assist axle for calculating.
 * @param filterAttrs filtering elements
 */
function locateNearestElement(
  currentElement: AbstractSelectorElement,
  elements: AbstractSelectorElement[],
  boundRectKey: BoundRect,
  assistAxle: Axle,
  filterAttrs?: AttrNames[]
): AbstractSelectorElement {
  let neareastElement: AbstractSelectorElement = currentElement;
  const neareastElements: AbstractSelectorElement[] = [];
  let minDistance = 10000;
  let distance = minDistance;
  const elementCandidates =
    filterAttrs && filterAttrs.length
      ? elements.filter(el => filterAttrs.find(attr => !!el.getAttribute(attr)))
      : elements;
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let assistMinDistance = 10000;
  let assistDistance;

  if (assistAxle === Axle.X) {
    // move up & down
    // prompt element with exception tab:
    // moveUp to bot_ask tab
    // moveDown: stay focus on original element
    if (currentElement.getAttribute(AttrNames.Tab) === PromptTab.EXCEPTIONS) {
      if (boundRectKey === BoundRect.Bottom) {
        return elementCandidates.find(
          ele =>
            ele.getAttribute(AttrNames.SelectedId) ===
            `${currentElement.getAttribute(AttrNames.FocusedId)}${PromptTab.BOT_ASKS}`
        ) as AbstractSelectorElement;
      } else {
        return currentElement;
      }
    }
    elementCandidates.forEach(element => {
      bounds = element.getBoundingClientRect();

      assistDistance = Math.abs(
        currentElementBounds.left + currentElementBounds.width / 2 - (bounds.left + bounds.width / 2)
      );
      if (boundRectKey === BoundRect.Top) {
        distance = bounds[boundRectKey] - currentElementBounds[boundRectKey];
      } else {
        distance = currentElementBounds[boundRectKey] - bounds[boundRectKey];
      }
      if (assistDistance < InitNodeSize.width / 2 && distance > 0 && distance < minDistance) {
        neareastElement = element;
        minDistance = distance;
      }
    });

    // If neareastElement is prompt node with exception tab and original node is not a prompt node, then stay focus on original element
    if (
      neareastElement.getAttribute(AttrNames.Tab) === PromptTab.EXCEPTIONS &&
      !currentElement.getAttribute(AttrNames.Tab)
    ) {
      return currentElement;
    }
  } else {
    // move left & right
    elementCandidates.forEach(element => {
      bounds = element.getBoundingClientRect();

      if (boundRectKey === BoundRect.Left) {
        distance =
          bounds[boundRectKey] +
          bounds.width / 2 -
          (currentElementBounds[boundRectKey] + currentElementBounds.width / 2);
      } else {
        distance =
          currentElementBounds[boundRectKey] -
          currentElementBounds.width / 2 -
          (bounds[boundRectKey] - bounds.width / 2);
      }
      assistDistance = Math.abs(
        currentElementBounds.top + currentElementBounds.height / 2 - (bounds.top + bounds.height / 2)
      );
      // find three element who is closer to the current element
      if (distance > 0 && distance <= minDistance && assistDistance <= assistMinDistance) {
        neareastElements[0] = element;
        minDistance = distance;
        assistMinDistance = assistDistance;
      }
    });

    let secondMinDistance = 1000;
    let secondAssistMinDistance = 1000;
    elementCandidates.forEach(element => {
      bounds = element.getBoundingClientRect();

      if (boundRectKey === BoundRect.Left) {
        distance =
          bounds[boundRectKey] +
          bounds.width / 2 -
          (currentElementBounds[boundRectKey] + currentElementBounds.width / 2);
      } else {
        distance =
          currentElementBounds[boundRectKey] -
          currentElementBounds.width / 2 -
          (bounds[boundRectKey] - bounds.width / 2);
      }
      assistDistance = Math.abs(
        currentElementBounds.top + currentElementBounds.height / 2 - (bounds.top + bounds.height / 2)
      );
      // find three element who is closer to the current element
      if (distance > 0) {
        if (distance <= secondMinDistance && distance > minDistance) {
          neareastElements[1] = element;
          secondMinDistance = distance;
        }
        if (assistDistance <= secondAssistMinDistance && assistDistance > assistMinDistance) {
          neareastElements[2] = element;
          secondAssistMinDistance = assistDistance;
        }
      }
    });
    const currentElementIdArrs = currentElement.getAttribute(AttrNames.SelectedId).split('.');
    let maxSamePath = 0;
    let samePathCount = 0;
    let samePath: string = currentElementIdArrs[0];
    let eleSelectedId = '';

    neareastElements.forEach(ele => {
      samePath = currentElementIdArrs[0];
      samePathCount = 0;
      eleSelectedId = ele.getAttribute(AttrNames.SelectedId);
      for (let i = 1; i < currentElementIdArrs.length; i++) {
        if (eleSelectedId.includes(samePath)) {
          samePath += `.${currentElementIdArrs[i]}`;
          samePathCount++;
        }
      }

      // calculate switchCondition default branch length
      let currentElementActionLength = currentElementIdArrs.length;
      currentElementIdArrs.forEach(action => {
        if (action.includes('default')) {
          currentElementActionLength++;
        }
      });
      // If the element's selectedId includes the original element's or its selectedId has the most overlap with the original element and selectedId's length is not more than the original element's, it is the neareast element
      // Else stay focus on the original element
      if (
        samePathCount > maxSamePath &&
        !(ele.getAttribute(AttrNames.Tab) === PromptTab.EXCEPTIONS && !currentElement.getAttribute(AttrNames.Tab)) &&
        (eleSelectedId.split('.').length <= currentElementActionLength ||
          eleSelectedId.includes(currentElementIdArrs.join('.')))
      ) {
        neareastElement = ele;
        maxSamePath = samePathCount;
      }
    });
  }

  return neareastElement;
}

function isParentRect(parentRect, childRect) {
  return (
    parentRect.left < childRect.left &&
    parentRect.right >= childRect.right &&
    parentRect.top < childRect.top &&
    parentRect.bottom > childRect.bottom
  );
}

function findSelectableChild(element: AbstractSelectorElement, elementList: AbstractSelectorElement[]) {
  const rect = element.getBoundingClientRect();
  return elementList.find(el => {
    const candidateRect = el.getBoundingClientRect();
    return isParentRect(rect, candidateRect);
  });
}

function findSelectableParent(element: AbstractSelectorElement, elementList: AbstractSelectorElement[]) {
  const rect = element.getBoundingClientRect();
  return elementList.find(el => {
    const candidateRect = el.getBoundingClientRect();
    return isParentRect(candidateRect, rect);
  });
}

function handleTabMove(
  currentElement: AbstractSelectorElement,
  selectableElements: AbstractSelectorElement[],
  command: string
) {
  let nextElement: AbstractSelectorElement;
  if (command === KeyboardCommandTypes.Cursor.MoveNext) {
    const selectableChild = findSelectableChild(currentElement, selectableElements);
    if (selectableChild) {
      // Tab to inner selectable element.
      nextElement = selectableChild;
    } else {
      // Perform like presssing down arrow key.
      nextElement = locateNearestElement(currentElement, selectableElements, BoundRect.Top, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
    }
  } else if (command === KeyboardCommandTypes.Cursor.MovePrevious) {
    const selectableParent = findSelectableParent(currentElement, selectableElements);
    if (selectableParent) {
      // Tab to parent.
      nextElement = selectableParent;
    } else {
      // Perform like pressing up arrow key.
      nextElement = locateNearestElement(currentElement, selectableElements, BoundRect.Bottom, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      // If prev element has child, tab to it before the element itself.
      const selectableChildInNext = findSelectableChild(nextElement, selectableElements);
      if (selectableChildInNext) {
        nextElement = selectableChildInNext;
      }
    }
  } else {
    // By default, stay focus on the origin element.
    nextElement = currentElement;
  }

  return nextElement;
}

function handleArrowkeyMove(
  currentElement: AbstractSelectorElement,
  selectableElements: AbstractSelectorElement[],
  command: string
) {
  let element: AbstractSelectorElement = currentElement;
  let boundRect: BoundRect = BoundRect.Bottom;
  let axle: Axle = Axle.X;
  let filterAttrs: AttrNames[] = [];

  switch (command) {
    case KeyboardCommandTypes.Cursor.MoveDown:
      boundRect = BoundRect.Top;
      axle = Axle.X;
      filterAttrs = [AttrNames.NodeElement];
      break;
    case KeyboardCommandTypes.Cursor.MoveUp:
      boundRect = BoundRect.Bottom;
      axle = Axle.X;
      filterAttrs = [AttrNames.NodeElement];
      break;
    case KeyboardCommandTypes.Cursor.MoveLeft:
      boundRect = BoundRect.Right;
      axle = Axle.Y;
      filterAttrs = [AttrNames.NodeElement];
      break;
    case KeyboardCommandTypes.Cursor.MoveRight:
      boundRect = BoundRect.Left;
      axle = Axle.Y;
      filterAttrs = [AttrNames.NodeElement];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveDown:
      boundRect = BoundRect.Top;
      axle = Axle.X;
      filterAttrs = [AttrNames.NodeElement, AttrNames.EdgeMenuElement];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveUp:
      boundRect = BoundRect.Bottom;
      axle = Axle.X;
      filterAttrs = [AttrNames.NodeElement, AttrNames.EdgeMenuElement];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveLeft:
      boundRect = BoundRect.Right;
      axle = Axle.Y;
      filterAttrs = [AttrNames.NodeElement, AttrNames.EdgeMenuElement];
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveRight:
      boundRect = BoundRect.Left;
      axle = Axle.Y;
      filterAttrs = [AttrNames.NodeElement, AttrNames.EdgeMenuElement];
      break;
    default:
      return element;
  }
  element = locateNearestElement(currentElement, selectableElements, boundRect, axle, filterAttrs);

  return element;
}

export function moveCursor(
  selectableElements: AbstractSelectorElement[],
  id: string,
  command: string
): { [key: string]: string | undefined } {
  const currentElement = selectableElements.find(
    element => element.getAttribute(AttrNames.SelectedId) === id || element.getAttribute(AttrNames.FocusedId) === id
  );
  if (!currentElement) return { selected: id, focused: undefined };
  let element: AbstractSelectorElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.Cursor.MovePrevious:
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = handleTabMove(currentElement, selectableElements, command);
      break;
    default:
      element = handleArrowkeyMove(currentElement, selectableElements, command);
      break;
  }

  return {
    selected: element.getAttribute(AttrNames.SelectedId) || id,
    focused: element.getAttribute(AttrNames.FocusedId) || undefined,
    tab: element.getAttribute(AttrNames.Tab) || '',
  };
}
