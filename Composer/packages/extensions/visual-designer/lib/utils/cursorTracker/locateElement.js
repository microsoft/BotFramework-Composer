// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { filterElementsByVector, sortElementsByVector } from './calculate/calculateByVector';
import { filterPromptElementsBySchema, filterElementBySchema } from './calculate/calculateBySchema';
/**
 *
 * @param currentElement current element
 * @param elements all elements have AttrNames.SelectableElements attribute
 * @param boundRectKey key to calculate shortest distance
 * @param assistAxle assist axle for calculating.
 * @param filterAttrs filtering elements
 */
export function locateNearestElement(currentElement, elements, direction, filterAttrs) {
  // Get elements that meet the filter criteria
  var elementArr = elements.filter(function (element) {
    return (
      !filterAttrs ||
      (filterAttrs &&
        filterAttrs.find(function (key) {
          return !!element[key];
        }))
    );
  });
  elementArr = filterPromptElementsBySchema(currentElement, elementArr, direction);
  elementArr = filterElementsByVector(currentElement, elementArr, direction);
  elementArr = sortElementsByVector(currentElement, elementArr, direction);
  elementArr = filterElementBySchema(currentElement, elementArr, direction);
  return elementArr.length > 0 ? elementArr[0] : currentElement;
}
//# sourceMappingURL=locateElement.js.map
