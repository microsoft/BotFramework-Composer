// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from './Boundary';

export enum DT {
  // Horizontal
  AxisX = 'axis-x',
  Left = 'left',
  LeftMargin = 'left-margin',
  RightMargin = 'right-margin',
  // Vertical
  Top = 'top',
  TopMargin = 'top-margin',
  BottomMargin = 'bottom-margin',
}

export type RelativeDistanceX = [DT.Left | DT.AxisX | DT.RightMargin | DT.LeftMargin, number];
export type RelativeDistanceY = [DT.Top | DT.TopMargin | DT.BottomMargin, number];

export type CoordDistance = [number, number];

export const transformRelativeDistance = (
  anchorBox: Boundary,
  currBox: Boundary,
  xDistance: RelativeDistanceX,
  yDistanece: RelativeDistanceY
): CoordDistance => {
  const [xType, xNum] = xDistance;
  let x = 0;
  switch (xType) {
    case DT.RightMargin:
      x = anchorBox.width + xNum;
      break;
    case DT.LeftMargin:
      x = -(currBox.width + xNum);
      break;
    case DT.AxisX:
      x = anchorBox.axisX - currBox.axisX + xNum;
      break;
    case DT.Left:
    default:
      x = xNum;
      break;
  }

  const [yType, yNum] = yDistanece;
  let y = 0;
  switch (yType) {
    case DT.BottomMargin:
      y = anchorBox.height + yNum;
      break;
    case DT.TopMargin:
      y = -(currBox.height + yNum);
      break;
    case DT.Top:
    default:
      y = yNum;
      break;
  }

  return [x, y];
};
