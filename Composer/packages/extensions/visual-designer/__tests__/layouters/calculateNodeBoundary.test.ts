import {
  calculateSequenceBoundary,
  calculateIfElseBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
} from '../../src/layouters/calculateNodeBoundary';
import { Boundary } from '../../src/shared/Boundary';

let boundary = new Boundary();

describe('calculateSequenceBoundary', () => {
  it('return an new boundary when input boundaries is empty array', () => {
    expect(calculateSequenceBoundary([])).toEqual(boundary);
  });
});

describe('calculateIfElseBoundary', () => {
  it('return an new boundary when input conditionBoundary or choiceBoundary is empty', () => {
    expect(calculateIfElseBoundary(null, boundary, boundary, boundary)).toEqual(boundary);
    expect(calculateIfElseBoundary(boundary, null, boundary, boundary)).toEqual(boundary);
  });
});

describe('calculateSwitchBoundary', () => {
  it('return an new boundary when input conditionBoundary or choiceBoundary is empty', () => {
    expect(calculateSwitchCaseBoundary(null, boundary, [])).toEqual(boundary);
  });
});

describe('calculateForeachBoundary', () => {
  it('return an new boundary when input foreachBoundary or stepsBoundary is empty array', () => {
    expect(calculateForeachBoundary(null, boundary, boundary, boundary)).toEqual(boundary);
    expect(calculateForeachBoundary(boundary, null, boundary, boundary)).toEqual(boundary);
  });
});
