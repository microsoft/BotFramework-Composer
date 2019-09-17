import { KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { InitNodeSize } from '../constants/ElementSizes';

function localeNearestElement(
  currentElement: HTMLElement,
  elements: NodeListOf<HTMLElement>,
  distanceKey: string,
  assistAxle: string,
  filterKeys?: Array<string>
): HTMLElement {
  let neareastElement: HTMLElement = currentElement;
  let minDistance = 10000;
  let distance = minDistance;
  const elementArr = Array.from(elements).filter(
    element => !filterKeys || (filterKeys && filterKeys.find(key => !!element.dataset[key]))
  );
  const currentElementBounds = currentElement.getBoundingClientRect();
  let bounds: ClientRect;
  let assistMinDistance = 10000;
  let assistDistance;
  let isInvolved: boolean = false;

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
      if (distanceKey === 'bottom') {
        isInvolved = distance < currentElementBounds.height;
      }
      if (!isInvolved && assistDistance < InitNodeSize.width / 2 && distance > 0 && distance < minDistance) {
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
export function moveCursor(
  selectedElements: NodeListOf<HTMLElement>,
  id: string,
  command: string
): { [key: string]: string | undefined } {
  const currentElement = Array.from(selectedElements).find(
    element => element.dataset['selectedId'] === id || element.dataset['focusedId'] === id
  );
  if (!currentElement) return { selected: id, focused: undefined };
  let element: HTMLElement = currentElement;
  switch (command) {
    case KeyboardCommandTypes.MoveDown:
      element = localeNearestElement(currentElement, selectedElements, 'top', 'x', ['isNode']);
      break;
    case KeyboardCommandTypes.MoveUp:
      element = localeNearestElement(currentElement, selectedElements, 'bottom', 'x', ['isNode']);
      break;
    case KeyboardCommandTypes.MoveLeft:
      element = localeNearestElement(currentElement, selectedElements, 'right', 'y', ['isNode']);
      break;
    case KeyboardCommandTypes.MoveRight:
      element = localeNearestElement(currentElement, selectedElements, 'left', 'y', ['isNode']);
      break;
    case KeyboardCommandTypes.ShortMoveDown:
      element = localeNearestElement(currentElement, selectedElements, 'top', 'x', ['isNode', 'isEdgeMenu']);
      break;
    case KeyboardCommandTypes.ShortMoveUp:
      element = localeNearestElement(currentElement, selectedElements, 'bottom', 'x', ['isNode', 'isEdgeMenu']);
      break;
    case KeyboardCommandTypes.ShortMoveLeft:
      element = localeNearestElement(currentElement, selectedElements, 'right', 'y', ['isNode', 'isEdgeMenu']);
      break;
    case KeyboardCommandTypes.ShortMoveRight:
      element = localeNearestElement(currentElement, selectedElements, 'left', 'y', ['isNode', 'isEdgeMenu']);
      break;
    case KeyboardCommandTypes.MovePrevious:
      element = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.MovePrevious);
      break;
    case KeyboardCommandTypes.MoveNext:
      element = localeElementByTab(currentElement, selectedElements, KeyboardCommandTypes.MoveNext);
      break;
  }
  element.scrollIntoView(true);

  return {
    selected: element.dataset['selectedId'] || id,
    focused: element.dataset['focusedId'],
  };
}
