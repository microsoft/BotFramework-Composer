// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SelectorElement, Direction } from './type';
import { filterElementsByVector, sortElementsByVector } from './calculate/calculateByVector';
import { filterPromptElementsBySchema, filterElementBySchema } from './calculate/calculateBySchema';
/**
 *
 * @param currentElement current element
 * @param elements all elements have AttrNames.SelectableElements attribute
 * @param direction direction in which to look for the nearest element
 * @param filterAttrs filtering elements
 */
export function locateNearestElement(
  currentElement: SelectorElement,
  elements: SelectorElement[],
  direction: Direction,
  filterAttrs?: string[]
): SelectorElement {
  // Get elements that meet the filter criteria
  let elementArr = elements.filter((element) => filterAttrs == null || filterAttrs.some((key) => element[key] != null));

  elementArr = filterPromptElementsBySchema(currentElement, elementArr, direction);
  elementArr = filterElementsByVector(currentElement, elementArr, direction);
  elementArr = sortElementsByVector(currentElement, elementArr, direction);
  elementArr = filterElementBySchema(currentElement, elementArr, direction);

  return elementArr?.[0] ?? currentElement;
}
