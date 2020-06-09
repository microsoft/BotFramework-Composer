// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SelectorElement, Axle, BoundRect, Direction } from '../type';
interface ElementVector {
  distance: number;
  assistDistance: number;
  selectedId: string;
}

function transformDirectionToVectorAttrs(direction: Direction): Record<string, any> {
  switch (direction) {
    case Direction.Up:
      return { assistAxle: Axle.X, boundRectKey: BoundRect.Bottom };
    case Direction.Down:
      return { assistAxle: Axle.X, boundRectKey: BoundRect.Top };
    case Direction.Left:
      return { assistAxle: Axle.Y, boundRectKey: BoundRect.Right };
    case Direction.Right:
      return { assistAxle: Axle.Y, boundRectKey: BoundRect.Left };
  }
}

function transformVectorToElement(vectors: ElementVector[], elements: SelectorElement[]): SelectorElement[] {
  const results: SelectorElement[] = [];
  vectors.forEach((vector) =>
    results.push(elements.find((element) => vector.selectedId === element.selectedId) as SelectorElement)
  );
  return results;
}
// calculate vector between element and currentElement
function calculateElementVector(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  boundRectKey: BoundRect,
  assistAxle: Axle
): ElementVector[] {
  const currentElementBounds = currentElement.bounds;
  const elementVectors: ElementVector[] = [];
  elements.forEach((element) => {
    const bounds = element.bounds;
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
      selectedId: element.selectedId as string,
    });
  });
  return elementVectors;
}

export function sortElementsByVector(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  direction: Direction
): SelectorElement[] {
  const { assistAxle, boundRectKey } = transformDirectionToVectorAttrs(direction);
  const elementVectors = calculateElementVector(currentElement, elements, boundRectKey, assistAxle);
  const candidates = elementVectors.sort((ele1, ele2) => ele1.distance - ele2.distance);

  return transformVectorToElement(candidates, elements);
}

export function filterElementsByVector(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  direction: Direction
): SelectorElement[] {
  const { assistAxle, boundRectKey } = transformDirectionToVectorAttrs(direction);
  const elementVectors = calculateElementVector(currentElement, elements, boundRectKey, assistAxle);
  const candidates: ElementVector[] = elementVectors.filter((ele) => ele.distance > 0);

  return transformVectorToElement(candidates, elements);
}
