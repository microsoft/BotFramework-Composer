// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Axle, BoundRect, Direction } from '../type';
function transformDirectionToVectorAttrs(direction) {
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
function transformVectorToElement(vectors, elements) {
  var results = [];
  vectors.forEach(function (vector) {
    return results.push(
      elements.find(function (element) {
        return vector.selectedId === element.selectedId;
      })
    );
  });
  return results;
}
// calculate vector between element and currentElement
function calculateElementVector(currentElement, elements, boundRectKey, assistAxle) {
  var currentElementBounds = currentElement.bounds;
  var elementVectors = [];
  elements.forEach(function (element) {
    var bounds = element.bounds;
    var distance;
    var assistDistance;
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
      distance: distance,
      assistDistance: assistDistance,
      selectedId: element.selectedId,
    });
  });
  return elementVectors;
}
export function sortElementsByVector(currentElement, elements, direction) {
  var _a = transformDirectionToVectorAttrs(direction),
    assistAxle = _a.assistAxle,
    boundRectKey = _a.boundRectKey;
  var elementVectors = calculateElementVector(currentElement, elements, boundRectKey, assistAxle);
  var candidates = elementVectors.sort(function (ele1, ele2) {
    return ele1.distance - ele2.distance;
  });
  return transformVectorToElement(candidates, elements);
}
export function filterElementsByVector(currentElement, elements, direction) {
  var _a = transformDirectionToVectorAttrs(direction),
    assistAxle = _a.assistAxle,
    boundRectKey = _a.boundRectKey;
  var elementVectors = calculateElementVector(currentElement, elements, boundRectKey, assistAxle);
  var candidates = elementVectors.filter(function (ele) {
    return ele.distance > 0;
  });
  return transformVectorToElement(candidates, elements);
}
//# sourceMappingURL=calculateByVector.js.map
