// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../../src/adaptive-flow-renderer/models/Boundary';
import {
  DT,
  RelativeDistanceX,
  RelativeDistanceY,
  transformRelativeDistance,
} from '../../../src/adaptive-flow-renderer/models/GraphDistanceUtils';

describe('transformRelativeDistance()', () => {
  const box1 = new Boundary(100, 50);
  const box2 = new Boundary(30, 30);

  const f = transformRelativeDistance.bind(this, box1, box2);

  it('horizontal moves correctly.', () => {
    const dy0: RelativeDistanceY = [DT.Top, 0];
    expect(f([DT.AxisX, 1], dy0)).toEqual([box1.axisX - box2.axisX + 1, 0]);
    expect(f([DT.Left, 2], dy0)).toEqual([2, 0]);
    expect(f([DT.LeftMargin, 3], dy0)).toEqual([-box2.width - 3, 0]);
    expect(f([DT.RightMargin, 4], dy0)).toEqual([box1.width + 4, 0]);
  });

  it('vertival moves correctly.', () => {
    const dx0: RelativeDistanceX = [DT.Left, 0];
    expect(f(dx0, [DT.Top, 1])).toEqual([0, 1]);
    expect(f(dx0, [DT.BottomMargin, 2])).toEqual([0, box1.height + 2]);
    expect(f(dx0, [DT.TopMargin, 3])).toEqual([0, -box2.height - 3]);
  });
});
