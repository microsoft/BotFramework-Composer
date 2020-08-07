// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const checkIsOutside = (x: number, y: number, element: HTMLElement) => {
  const { left, top, right, bottom } = element.getBoundingClientRect();

  return x < left || x > right || y < top || y > bottom;
};
