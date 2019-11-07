// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PromptTab } from '@bfc/shared';
import { element } from 'prop-types';

import { InitNodeSize, LoopEdgeMarginLeft, IconBrickSize, ElementInterval } from '../constants/ElementSizes';
import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { AttrNames } from '../constants/ElementAttributes';
import { AbstractSelectorElement } from '../models/SelectorElement';

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

interface ElementVector {
  distance: number;
  assistDistance: number;
  selectedId: string;
}

// calculate vector between element and currentElement
function calculateElementVector(
  currentElement: AbstractSelectorElement,
  elements: AbstractSelectorElement[],
  boundRectKey: BoundRect,
  assistAxle: Axle
): ElementVector[] {
  const currentElementBounds = currentElement.getBoundingClientRect();
  const elementVectors: ElementVector[] = [];
  elements.forEach(element => {
    const bounds: ClientRect = element.getBoundingClientRect();
    let distance: number;
    let assistDistance: number;

    if (assistAxle === Axle.X) {
      if (boundRectKey === BoundRect.Top) {
        distance = bounds[boundRectKey] - currentElementBounds[boundRectKey];
      } else {
        distance = currentElementBounds[boundRectKey] - bounds[boundRectKey];
      }
      assistDistance = Math.abs(
        currentElementBounds.left + currentElementBounds.width / 2 - (bounds.left + bounds.width / 2)
      );
    } else {
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
    }
    elementVectors.push({
      distance,
      assistDistance,
      selectedId: element.getAttribute(AttrNames.SelectedId),
    });
  });
  return elementVectors;
}

function locateCandidateElementsByVenctor(elements: ElementVector[], assistAxle: Axle): ElementVector[] {
  const candidates: ElementVector[] = [
    {
      distance: 1000,
      assistDistance: 100000,
      selectedId: '',
    },
    {
      distance: 1000,
      assistDistance: 1000,
      selectedId: '',
    },
    {
      distance: 1000,
      assistDistance: 1000,
      selectedId: '',
    },
  ];
  if (assistAxle === Axle.X) {
    elements.forEach(element => {
      if (
        element.assistDistance < InitNodeSize.width / 2 &&
        element.distance > 0 &&
        element.distance < candidates[0].distance
      ) {
        candidates[0] = element;
      }
    });
  } else {
    // x is the length of the botAsk node and the exception node on x-axis
    const x = (IconBrickSize.width + InitNodeSize.width) / 2 + LoopEdgeMarginLeft;

    elements.forEach(element => {
      // find three element who is closer to the current element
      if (
        element.distance > 0 &&
        (element.distance > x &&
          element.distance / element.assistDistance > candidates[0].distance / candidates[0].assistDistance)
      ) {
        candidates[0] = element;
      }
    });
    elements.forEach(element => {
      // find three element who is closer to the current element
      if (element.distance > 0) {
        if (element.distance <= candidates[1].distance && element.distance <= candidates[0].distance) {
          candidates[1] = element;
        }
        if (
          element.assistDistance <= candidates[2].assistDistance &&
          element.assistDistance <= candidates[0].assistDistance
        ) {
          candidates[2] = element;
        }
      }
    });
  }
  return candidates;
}

function getActionLength(element: AbstractSelectorElement): number {
  const arrs = element.getAttribute(AttrNames.SelectedId).split('.');
  let length = arrs.length;

  arrs.forEach(action => {
    if (action.includes('default')) {
      length++;
    }
  });
  return length;
}

function locateNearestElementBySchema(
  candidateElements: AbstractSelectorElement[],
  currentElement: AbstractSelectorElement,
  assistAxle: Axle,
  boundRectKey: BoundRect
): AbstractSelectorElement {
  let neareastElement: AbstractSelectorElement = currentElement;

  if (assistAxle === Axle.X) {
    // prompt element with OTHER tab:
    // moveUp to bot_ask tab
    // moveDown: stay focus on original element
    if (currentElement.getAttribute(AttrNames.Tab) === PromptTab.OTHER) {
      if (boundRectKey === BoundRect.Bottom) {
        neareastElement = candidateElements.find(
          ele =>
            ele.getAttribute(AttrNames.SelectedId) ===
            `${currentElement.getAttribute(AttrNames.FocusedId)}${PromptTab.BOT_ASKS}`
        ) as AbstractSelectorElement;
      } else {
        neareastElement = currentElement;
      }
    } else {
      neareastElement = candidateElements[0];
    }
  } else {
    const currentElementIdArrs = currentElement.getAttribute(AttrNames.SelectedId).split('.');
    let maxSamePath = 0;
    let samePathCount = 0;
    let samePath: string = currentElementIdArrs[0];
    let eleSelectedId = '';
    let eleActionLength = 0;

    candidateElements.forEach(ele => {
      samePath = currentElementIdArrs[0];
      samePathCount = 0;
      eleSelectedId = ele.getAttribute(AttrNames.SelectedId);
      eleActionLength = getActionLength(ele);
      for (let i = 1; i < currentElementIdArrs.length; i++) {
        if (eleSelectedId.includes(samePath)) {
          samePath += `.${currentElementIdArrs[i]}`;
          samePathCount++;
        }
      }

      // If the element's selectedId includes the original element's or its selectedId has the most overlap with the original element and selectedId's length is not more than the original element's, it is the neareast element
      // Else stay focus on the original element
      if (!(ele.getAttribute(AttrNames.Tab) === PromptTab.OTHER && !currentElement.getAttribute(AttrNames.Tab))) {
        if (samePathCount > maxSamePath) {
          neareastElement = ele;
          maxSamePath = samePathCount;
        } else if (samePathCount === maxSamePath) {
          if (
            eleActionLength < getActionLength(neareastElement) ||
            (eleActionLength > getActionLength(neareastElement) && eleActionLength <= getActionLength(currentElement))
          ) {
            neareastElement = ele;
            maxSamePath = samePathCount;
          } else {
            const eleActionArr = eleSelectedId.split('.');
            const nearElementActionArr = neareastElement.getAttribute(AttrNames.SelectedId).split('.');
            const currentElementDifferentActionIndex = Number(
              currentElementIdArrs[maxSamePath].substring(
                currentElementIdArrs[maxSamePath].indexOf('[') + 1,
                currentElementIdArrs[maxSamePath].indexOf(']')
              )
            );
            const eleDifferentActionIndex = Number(
              eleActionArr[maxSamePath].substring(
                eleActionArr[maxSamePath].indexOf('[') + 1,
                eleActionArr[maxSamePath].indexOf(']')
              )
            );
            const neareastElementDifferentActionIndex = Number(
              nearElementActionArr[maxSamePath].substring(
                nearElementActionArr[maxSamePath].indexOf('[') + 1,
                nearElementActionArr[maxSamePath].indexOf(']')
              )
            );

            if (
              Math.abs(currentElementDifferentActionIndex - eleDifferentActionIndex) <
              Math.abs(currentElementDifferentActionIndex - neareastElementDifferentActionIndex)
            ) {
              neareastElement = ele;
              maxSamePath = samePathCount;
            }
          }
        }
      }
    });
  }
  return neareastElement;
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
  // Get elements that meet the filter criteria
  const elementArr = elements.filter(
    element => !filterAttrs || (filterAttrs && filterAttrs.find(key => !!element.getAttribute(key)))
  );

  // Calculate element's vector and choose candidate elements by comparing  elements' position
  const elementVectors = calculateElementVector(currentElement, elementArr, boundRectKey, assistAxle);
  const candidateElementVenctors = locateCandidateElementsByVenctor(elementVectors, assistAxle);
  const candidateElements = elementArr.filter(element =>
    candidateElementVenctors.find(venctor => venctor.selectedId === element.getAttribute(AttrNames.SelectedId))
  );

  // Choose the neareastElement by schema
  const neareastElement = locateNearestElementBySchema(candidateElements, currentElement, assistAxle, boundRectKey);

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

function findSelectableChildren(element: AbstractSelectorElement, elementList: AbstractSelectorElement[]) {
  const rect = element.getBoundingClientRect();
  return elementList.filter(el => {
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
    const selectableChildren = findSelectableChildren(currentElement, selectableElements);
    if (selectableChildren.length > 0) {
      // Tab to inner selectable element.
      nextElement = selectableChildren[0];
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

  // tab move or arrow move
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

export function querySelectableElements(): AbstractSelectorElement[] {
  const items: AbstractSelectorElement[] = [];
  Array.from(document.querySelectorAll(`[${AttrNames.SelectableElement}]`)).forEach(ele => {
    items.push(new AbstractSelectorElement(ele as HTMLElement));
  });
  return items;
}
