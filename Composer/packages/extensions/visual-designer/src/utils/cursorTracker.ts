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
  let assistMinDistance = 10000;
  let assistDistance;

  elementArr.forEach(element => {
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

function locateElementByTab(currentElement: HTMLElement, elements: NodeListOf<HTMLElement>, command: string) {
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
      selectedElement = locateNearestElement(currentElement, elements, BoundRect.Top, Axle.X, [
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
      selectedElement = locateNearestElement(currentElement, elements, BoundRect.Bottom, Axle.X, [
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

function handleArrowkeyMove(currentElement: HTMLElement, selectedElements: NodeListOf<HTMLElement>, command: string) {
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

  element = locateNearestElement(currentElement, selectedElements, boundRect, axle, filterAttrs);
  return element;
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
    case KeyboardCommandTypes.Cursor.MovePrevious:
    case KeyboardCommandTypes.Cursor.MoveNext:
      element = locateElementByTab(currentElement, selectedElements, command);
      break;
    default:
      element = handleArrowkeyMove(currentElement, selectedElements, command);
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
