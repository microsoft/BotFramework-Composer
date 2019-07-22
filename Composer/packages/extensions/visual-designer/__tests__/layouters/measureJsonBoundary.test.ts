import { Boundary } from '../../src/shared/Boundary';
import { measureJsonBoundary } from '../../src/layouters/measureJsonBoundary';
import { ObiTypes } from '../../src/shared/ObiTypes';
import { DiamondSize, InitNodeSize, LoopIconSize } from '../../src/shared/elementSizes';

describe('measureJsonBoundary', () => {
  let boundary = new Boundary();

  it('should return an empty boundary when json is null or json.$type is null', () => {
    expect(measureJsonBoundary(null)).toEqual(boundary);
    expect(measureJsonBoundary({ a: 1 })).toEqual(boundary);
  });
  it('should return boundary whose size according to the json.$type', () => {
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
});
