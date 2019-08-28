import { Boundary } from '../../src/models/Boundary';
import { measureJsonBoundary } from '../../src/layouters/measureJsonBoundary';
import { ObiTypes } from '../../src/constants/ObiTypes';
import {
  DiamondSize,
  InitNodeSize,
  LoopIconSize,
  ChoiceInputSize,
  ChoiceInputMarginTop,
} from '../../src/shared/elementSizes';

describe('measureJsonBoundary', () => {
  const boundary = new Boundary();

  it('should return an empty boundary when json is null or json.$type is null', () => {
    expect(measureJsonBoundary(null)).toEqual(boundary);
    expect(measureJsonBoundary({ a: 1 })).toEqual(boundary);
  });
  it('should return boundary whose size is determined by the json.$type', () => {
    expect(measureJsonBoundary({ $type: ObiTypes.ChoiceDiamond })).toEqual(
      new Boundary(DiamondSize.width, DiamondSize.height)
    );
    expect(measureJsonBoundary({ $type: ObiTypes.ConditionNode })).toEqual(
      new Boundary(InitNodeSize.width, InitNodeSize.height)
    );
    expect(measureJsonBoundary({ $type: ObiTypes.LoopIndicator })).toEqual(
      new Boundary(LoopIconSize.width, LoopIconSize.height)
    );
    expect(measureJsonBoundary({ $type: ObiTypes.LogStep })).toEqual(
      new Boundary(InitNodeSize.width, InitNodeSize.height)
    );
  });
  it("should return boundary whose size is determined by the data's choices when json.$type is choiceInput", () => {
    const data: { [key: string]: any } = {
      $type: ObiTypes.ChoiceInput,
      choices: [{ value: '1' }],
    };

    expect(measureJsonBoundary(data)).toEqual(
      new Boundary(InitNodeSize.width, InitNodeSize.height + ChoiceInputSize.height + ChoiceInputMarginTop)
    );
  });
});
