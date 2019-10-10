import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { InitNodeSize } from '../constants/ElementSizes';
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
function locateNearestElement(
  currentElement: HTMLElement,
  elements: HTMLElement[],
  boundRectKey: BoundRect,
  assistAxle: Axle,
  filterAttrs?: AttrNames[]
): HTMLElement {
  let neareastElement: HTMLElement = currentElement;
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

  elementCandidates.forEach(element => {
    bounds = element.getBoundingClientRect();
    if (boundRectKey === BoundRect.Top || boundRectKey === BoundRect.Left) {
      distance = bounds[boundRectKey] - currentElementBounds[boundRectKey];
    } else {
      distance = currentElementBounds[boundRectKey] - bounds[boundRectKey];
    }

    if (assistAxle === Axle.X) {
      assistDistance = Math.abs(
        currentElementBounds.left + currentElementBounds.width / 2 - (bounds.left + bounds.width / 2)
      );
      if (assistDistance < InitNodeSize.width / 2 && distance > 0 && distance < minDistance) {
        neareastElement = element;
        minDistance = distance;
      }
    } else {
      assistDistance = Math.abs(
        currentElementBounds.top + currentElementBounds.height / 2 - (bounds.top + bounds.height / 2)
      );
      if (distance > 0 && distance <= minDistance && assistMinDistance >= assistDistance) {
        neareastElement = element;
        minDistance = distance;
        assistMinDistance = assistDistance;
      }
    }
  });
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

function findSelectableChild(element: HTMLElement, elementList: HTMLElement[]) {
  const rect = element.getBoundingClientRect();
  return elementList.find(el => {
    const candidateRect = el.getBoundingClientRect();
    return isParentRect(rect, candidateRect);
  });
}

function findSelectableParent(element: HTMLElement, elementList: HTMLElement[]) {
  const rect = element.getBoundingClientRect();
  return elementList.find(el => {
    const candidateRect = el.getBoundingClientRect();
    return isParentRect(candidateRect, rect);
  });
}

function handleTabMove(currentElement: HTMLElement, selectableElements: HTMLElement[], command: string) {
  let nextElement: HTMLElement;
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

function handleArrowkeyMove(currentElement: HTMLElement, selectableElements: HTMLElement[], command: string) {
  let element: HTMLElement = currentElement;
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
  selectableElements: HTMLElement[],
  id: string,
  command: string
): { [key: string]: string | undefined } {
  const currentElement = selectableElements.find(
    element => element.dataset.selectedId === id || element.dataset.focusedId === id
  );
  if (!currentElement) return { selected: id, focused: undefined };
  let element: HTMLElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.Cursor.MovePrevious:
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = handleTabMove(currentElement, selectableElements, command);
      break;
    default:
      element = handleArrowkeyMove(currentElement, selectableElements, command);
      break;
  }
  element.scrollIntoView(true);
  window.scrollBy(0, -10);

  return {
    selected: element.getAttribute(AttrNames.SelectedId) || id,
    focused: element.getAttribute(AttrNames.FocusedId) || undefined,
    tab: element.getAttribute(AttrNames.Tab) || '',
  };
}
