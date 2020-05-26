// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Boundary } from '../../../src/models/Boundary';
import { measureJsonBoundary } from '../../../src/adaptive-sdk/layouters/measureJsonBoundary';
import { ObiTypes } from '../../../src/constants/ObiTypes';
import {
  DiamondSize,
  InitNodeSize,
  LoopIconSize,
  ChoiceInputSize,
  ChoiceInputMarginTop,
  ChoiceInputMarginBottom,
  StandardNodeWidth,
  HeaderHeight,
} from '../../../src/constants/ElementSizes';

describe('measureJsonBoundary', () => {
  const boundary = new Boundary();

  it('should return an empty boundary when json is null or json.$kind is null', () => {
    expect(measureJsonBoundary(null)).toEqual(boundary);
    expect(measureJsonBoundary({ a: 1 })).toEqual(boundary);
  });
  it('should return boundary whose size is determined by the json.$kind', () => {
    expect(measureJsonBoundary({ $kind: ObiTypes.ChoiceDiamond })).toEqual(
      new Boundary(DiamondSize.width, DiamondSize.height)
    );
    expect(measureJsonBoundary({ $kind: ObiTypes.ConditionNode })).toEqual(
      new Boundary(InitNodeSize.width, InitNodeSize.height)
    );
    expect(measureJsonBoundary({ $kind: ObiTypes.LoopIndicator })).toEqual(
      new Boundary(LoopIconSize.width, LoopIconSize.height)
    );
    expect(measureJsonBoundary({ $kind: ObiTypes.LogAction })).toEqual(new Boundary(StandardNodeWidth, HeaderHeight));
  });
  it("should return boundary whose size is determined by the data's choices when json.$kind is choiceInput", () => {
    const data1: { [key: string]: any } = {
      $kind: ObiTypes.ChoiceInputDetail,
      choices: [{ value: '1' }],
    };

    const data2: { [key: string]: any } = {
      $kind: ObiTypes.ChoiceInputDetail,
      choices: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }],
    };
    expect(measureJsonBoundary(data1)).toEqual(
      new Boundary(
        InitNodeSize.width,
        InitNodeSize.height + ChoiceInputSize.height + ChoiceInputMarginTop + ChoiceInputMarginBottom
      )
    );
    expect(measureJsonBoundary(data2)).toEqual(
      new Boundary(InitNodeSize.width, InitNodeSize.height + 4 * (ChoiceInputSize.height + ChoiceInputMarginTop))
    );
  });
});
