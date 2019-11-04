// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { element } from 'prop-types';

import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { InitNodeSize, LoopEdgeMarginLeft, IconBrickSize, ElementInterval } from '../constants/ElementSizes';
import { AttrNames } from '../constants/ElementAttributes';

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
  currentElement: HTMLElement,
  element: HTMLElement,
  boundRectKey: BoundRect,
  assistAxle: Axle
): ElementVector {
  const currentElementBounds = currentElement.getBoundingClientRect();
  const bounds: ClientRect = element.getBoundingClientRect();
  let distance;
  let assistDistance;

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
        bounds[boundRectKey] + bounds.width / 2 - (currentElementBounds[boundRectKey] + currentElementBounds.width / 2);
    } else {
      distance =
        currentElementBounds[boundRectKey] - currentElementBounds.width / 2 - (bounds[boundRectKey] - bounds.width / 2);
    }
    assistDistance = Math.abs(
      currentElementBounds.top + currentElementBounds.height / 2 - (bounds.top + bounds.height / 2)
    );
  }
  return {
    distance,
    assistDistance,
    selectedId: element.getAttribute(AttrNames.SelectedId),
  } as ElementVector;
}

// get the neareast element by caculating the venctor.
function localeElementByVenctor(elements: ElementVector[], assistAxle: Axle): ElementVector {
  let minElement: ElementVector = {
    distance: 1000,
    assistDistance: 1000,
    selectedId: '',
  };

  // x is the length of the botAsk node and the exception node on x-axis
  // y is the length of the botAsk node and the exception node on y-axis
  // minCot is the cot angle of x and y
  const x = (IconBrickSize.width + InitNodeSize.width) / 2 + LoopEdgeMarginLeft;
  const y = ElementInterval.y + InitNodeSize.height;
  const minCot = x / y;

  elements.forEach(element => {
    if (assistAxle === Axle.X) {
      if (
        element.assistDistance < InitNodeSize.width / 2 &&
        element.distance > 0 &&
        element.distance < minElement.distance
      ) {
        minElement = element;
      }
    } else {
      // Only when the neareast node and the current node's cot angle must bigger than minCot can we avoid move left or right to the wrong exception node
      if (
        element.distance > 0 &&
        (element.distance / element.assistDistance > minCot || element.distance > x) &&
        element.distance <= minElement.distance
      ) {
        if (element.assistDistance > minElement.assistDistance && element.distance < minElement.distance) {
          minElement = element;
        } else if (element.assistDistance <= minElement.assistDistance && element.distance <= minElement.distance) {
          minElement = element;
        }
      }
    }
  });
  return minElement;
}

/**
 *
 * @param currentElement current element
 * @param elements all elements have AttrNames.SelectableElements attribute
 * @param boundRectKey key to calculate shortest distance
 * @param assistAxle assist axle for calculating.
 * @param filterAttrs filtering elements
 */
function localeNearestElement(
  currentElement: HTMLElement,
  elements: HTMLElement[],
  boundRectKey: BoundRect,
  assistAxle: Axle,
  filterAttrs?: AttrNames[]
): HTMLElement {
  let neareastElement: HTMLElement = currentElement;
  const elementArr = elements.filter(
    element => !filterAttrs || (filterAttrs && filterAttrs.find(key => !!element.getAttribute(key)))
  );
  const elementVectors = elementArr.map(element =>
    calculateElementVector(currentElement, element, boundRectKey, assistAxle)
  );
  neareastElement = elementArr.find(
    element =>
      element.getAttribute(AttrNames.SelectedId) === localeElementByVenctor(elementVectors, assistAxle).selectedId
  ) as HTMLElement;
  return neareastElement;
}

function localeElementByTab(currentElement: HTMLElement, elements: HTMLElement[], command: string) {
  let elementArr = elements;
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let selectedElement: HTMLElement = currentElement;
  let selectedElementBounds: ClientRect;
  let isInvolved = false;
  const judgeElementRelation = (parentBounds, childBounds) => {
    return (
      parentBounds.left < childBounds.left &&
      parentBounds.right >= childBounds.right &&
      parentBounds.top < childBounds.top &&
      parentBounds.bottom > childBounds.bottom
    );
  };
  if (command === KeyboardCommandTypes.Cursor.MoveNext) {
    elementArr.forEach(element => {
      bounds = element.getBoundingClientRect();
      if (judgeElementRelation(currentElementBounds, bounds)) {
        isInvolved = true;
        selectedElement = element;
      }
    });
    if (!isInvolved) {
      elementArr = elements.filter(ele => !judgeElementRelation(ele.getBoundingClientRect(), currentElementBounds));
      selectedElement = localeNearestElement(currentElement, elementArr, BoundRect.Top, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
    }
  } else {
    elementArr.forEach(element => {
      bounds = element.getBoundingClientRect();
      if (judgeElementRelation(bounds, currentElementBounds)) {
        isInvolved = true;
        selectedElement = element;
      }
    });
    if (!isInvolved) {
      elementArr = elements.filter(ele => !judgeElementRelation(ele.getBoundingClientRect(), currentElementBounds));
      selectedElement = localeNearestElement(currentElement, elementArr, BoundRect.Bottom, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      selectedElementBounds = selectedElement.getBoundingClientRect();
      elementArr.forEach(element => {
        bounds = element.getBoundingClientRect();
        if (judgeElementRelation(selectedElementBounds, bounds)) {
          selectedElement = element;
        }
      });
    }
  }
  return selectedElement;
}
export function moveCursor(
  selectedElements: NodeListOf<HTMLElement>,
  id: string,
  command: string
): { [key: string]: string | undefined } {
  const elements = Array.from(selectedElements);
  const currentElement = Array.from(selectedElements).find(
    element => element.dataset.selectedId === id || element.dataset.focusedId === id
  );
  if (!currentElement) return { selected: id, focused: undefined };
  let element: HTMLElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.Cursor.MoveDown:
      element = localeNearestElement(currentElement, elements, BoundRect.Top, Axle.X, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.MoveUp:
      element = localeNearestElement(currentElement, elements, BoundRect.Bottom, Axle.X, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.MoveLeft:
      element = localeNearestElement(currentElement, elements, BoundRect.Right, Axle.Y, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.MoveRight:
      element = localeNearestElement(currentElement, elements, BoundRect.Left, Axle.Y, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveDown:
      element = localeNearestElement(currentElement, elements, BoundRect.Top, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveUp:
      element = localeNearestElement(currentElement, elements, BoundRect.Bottom, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveLeft:
      element = localeNearestElement(currentElement, elements, BoundRect.Right, Axle.Y, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveRight:
      element = localeNearestElement(currentElement, elements, BoundRect.Left, Axle.Y, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.MovePrevious:
      element = localeElementByTab(currentElement, elements, KeyboardCommandTypes.Cursor.MovePrevious);
      break;
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = localeElementByTab(currentElement, elements, KeyboardCommandTypes.Cursor.MoveNext);
      break;
  }
  element.scrollIntoView(true);

  return {
    selected: element.getAttribute(AttrNames.SelectedId) || id,
    focused: element.getAttribute(AttrNames.FocusedId) || undefined,
    tab: element.getAttribute(AttrNames.Tab) || '',
  };
}
