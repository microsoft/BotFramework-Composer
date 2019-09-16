import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { InitNodeSize } from '../constants/ElementSizes';

function localeNearestElement(
  currentElement: HTMLElement,
  elements: NodeListOf<HTMLElement>,
  distanceKey: string,
  assistAxle: string,
  filterKey?: string
): HTMLElement {
  let neareastElement: HTMLElement = currentElement;
  let minDistance = 10000;
  let distance = minDistance;
  const elementArr = Array.from(elements).filter(element => !filterKey || (filterKey && element.dataset[filterKey]));
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let assistMinDistance = 10000;
  let assistDistance;

  elementArr.forEach(element => {
    bounds = element.getBoundingClientRect();
    if (distanceKey === 'top' || distanceKey === 'left') {
      distance = bounds[distanceKey] - currentElementBounds[distanceKey];
    } else {
      distance = currentElementBounds[distanceKey] - bounds[distanceKey];
    }

    if (assistAxle === 'x') {
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
      if (distance > 0 && distance <= minDistance && assistMinDistance > assistDistance) {
        neareastElement = element;
        minDistance = distance;
        assistMinDistance = assistDistance;
      }
    }
  });
  return neareastElement;
}

function localeElementByTab(currentElement: HTMLElement, elements: NodeListOf<HTMLElement>, command: string) {
  const elementArr = Array.from(elements);
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let isInvolved = false;
  let selectedElement: HTMLElement = currentElement;
  if (command === KeyboardCommandTypes.MoveNext) {
    elementArr.forEach(element => {
      bounds = element.getBoundingClientRect();
      if (
        currentElementBounds.left < bounds.left &&
        currentElementBounds.right >= bounds.right &&
        currentElementBounds.top < bounds.top &&
        currentElementBounds.bottom > bounds.bottom
      ) {
        isInvolved = true;
        selectedElement = element;
      }
    });
    if (!isInvolved) {
      selectedElement = localeNearestElement(currentElement, elements, 'top', 'x');
    }
  } else {
    elementArr.forEach(element => {
      bounds = element.getBoundingClientRect();
      if (
        currentElementBounds.left > bounds.left &&
        currentElementBounds.right <= bounds.right &&
        currentElementBounds.top > bounds.top &&
        currentElementBounds.bottom < bounds.bottom
      ) {
        isInvolved = true;
        selectedElement = element;
      }
    });
    if (!isInvolved) {
      selectedElement = localeNearestElement(currentElement, elements, 'bottom', 'x');
    }
  }
  return selectedElement;
}
export function moveCursor(selectedElements: NodeListOf<HTMLElement>, focusedId: string, command: string): string {
  const currentElement = Array.from(selectedElements).find(element => element.dataset['selectedId'] === focusedId);
  if (!currentElement) return focusedId;
  let movedToElemet: HTMLElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.MoveDown:
      movedToElemet = localeNearestElement(currentElement, selectedElements, 'top', 'x', 'isNode');
      break;
    case KeyboardCommandTypes.MoveUp:
      movedToElemet = localeNearestElement(currentElement, selectedElements, 'bottom', 'x', 'isNode');
      break;
    case KeyboardCommandTypes.MoveLeft:
      movedToElemet = localeNearestElement(currentElement, selectedElements, 'right', 'y', 'isNode');
      break;
    case KeyboardCommandTypes.MoveRight:
      movedToElemet = localeNearestElement(currentElement, selectedElements, 'left', 'y', 'isNode');
      break;
    case KeyboardCommandTypes.MovePrevious:
      movedToElemet = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.MovePrevious);
      break;
    case KeyboardCommandTypes.MoveNext:
      movedToElemet = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.MoveNext);
      break;
  }
  movedToElemet.scrollIntoView(true);
  return movedToElemet.dataset['selectedId'] || focusedId;
}
