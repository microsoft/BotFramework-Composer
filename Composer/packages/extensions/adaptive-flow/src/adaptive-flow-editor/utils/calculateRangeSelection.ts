// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const calculateRangeSelection = (
  focusedId: string,
  clickedId: string,
  orderedSelectableIds: string[]
): string[] => {
  const range = [focusedId, clickedId].map((id) => orderedSelectableIds.findIndex((x) => x === id));
  const [fromIndex, toIndex] = range.sort();
  return orderedSelectableIds.slice(fromIndex, toIndex + 1);
};
