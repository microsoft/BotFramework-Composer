// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  elements: NodeListOf<HTMLElement>,
  boundRectKey: BoundRect,
  assistAxle: Axle,
  filterAttrs?: AttrNames[]
): HTMLElement {
  let neareastElement: HTMLElement = currentElement;
  let minDistance = 10000;
  let distance = minDistance;
  const elementArr = Array.from(elements).filter(
    element => !filterAttrs || (filterAttrs && filterAttrs.find(key => !!element.getAttribute(key)))
  );
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let assistDistance;

  // x is the length of the botAsk node and the exception node on x-axis
  // y is the length of the botAsk node and the exception node on y-axis
  // minCot is the cot angle of x and y
  const x = (IconBrickSize.width + InitNodeSize.width) / 2 + LoopEdgeMarginLeft;
  const y = ElementInterval.y + InitNodeSize.height;
  const minCot = x / y;
  let minAssistDistance = 10000;

  elementArr.forEach(element => {
    bounds = element.getBoundingClientRect();

    if (assistAxle === Axle.X) {
      if (boundRectKey === BoundRect.Top) {
        distance = bounds[boundRectKey] - currentElementBounds[boundRectKey];
      } else {
        distance = currentElementBounds[boundRectKey] - bounds[boundRectKey];
      }
      assistDistance = Math.abs(
        currentElementBounds.left + currentElementBounds.width / 2 - (bounds.left + bounds.width / 2)
      );
      if (assistDistance < InitNodeSize.width / 2 && distance > 0 && distance < minDistance) {
        neareastElement = element;
        minDistance = distance;
      }
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

      // Only when the neareast node and the current node's cot angle must bigger than minCot can we avoid move left or right to the wrong exception node
      if (distance > 0 && (distance / assistDistance > minCot || distance > x) && distance <= minDistance) {
        if (assistDistance > minAssistDistance && distance < minDistance) {
          neareastElement = element;
          minDistance = distance;
        } else if (assistDistance <= minAssistDistance && distance <= minDistance) {
          neareastElement = element;
          minDistance = distance;
          minAssistDistance = assistDistance;
        }
      }
    }
  });
  return neareastElement;
}

function localeElementByTab(currentElement: HTMLElement, elements: NodeListOf<HTMLElement>, command: string) {
  const elementArr = Array.from(elements);
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
      selectedElement = localeNearestElement(currentElement, elements, BoundRect.Top, Axle.X, [
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
      selectedElement = localeNearestElement(currentElement, elements, BoundRect.Bottom, Axle.X, [
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
  const currentElement = Array.from(selectedElements).find(
    element => element.dataset.selectedId === id || element.dataset.focusedId === id
  );
  if (!currentElement) return { selected: id, focused: undefined };
  let element: HTMLElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.Cursor.MoveDown:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Top, Axle.X, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.MoveUp:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Bottom, Axle.X, [
        AttrNames.NodeElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.MoveLeft:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Right, Axle.Y, [
        AttrNames.NodeElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.MoveRight:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Left, Axle.Y, [AttrNames.NodeElement]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveDown:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Top, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveUp:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Bottom, Axle.X, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveLeft:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Right, Axle.Y, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.ShortMoveRight:
      element = localeNearestElement(currentElement, selectedElements, BoundRect.Left, Axle.Y, [
        AttrNames.NodeElement,
        AttrNames.EdgeMenuElement,
      ]);
      break;
    case KeyboardCommandTypes.Cursor.MovePrevious:
      element = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.Cursor.MovePrevious);
      break;
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.Cursor.MoveNext);
      break;
  }
  element.scrollIntoView(true);

  return {
    selected: element.getAttribute(AttrNames.SelectedId) || id,
    focused: element.getAttribute(AttrNames.FocusedId) || undefined,
    tab: element.getAttribute(AttrNames.Tab) || '',
  };
}
