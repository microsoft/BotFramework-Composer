import {
  calculateSequenceBoundary,
  calculateIfElseBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
} from '../../src/layouters/calculateNodeBoundary';
import { Boundary } from '../../src/models/Boundary';
import { ElementInterval, LoopEdgeMarginLeft } from '../../src/constants/ElementSizes';

const boundary = new Boundary();
const BranchIntervalX = ElementInterval.x;
const BranchIntervalY = ElementInterval.y / 2;
describe('calculateSequenceBoundary', () => {
  let boundaries;
  beforeEach(() => {
    boundaries = [new Boundary(280, 80), new Boundary(180, 100)];
  });
  it('should return an new boundary when input boundaries is empty array', () => {
    expect(calculateSequenceBoundary([])).toEqual(boundary);
  });

  it('should return a box whose property be calcalated by inputing boundaries', () => {
    const returnBoundary = {
      width: 280,
      height: 180 + ElementInterval.y * 2,
      axisX: 140,
      axisY: 0,
    };
    expect(calculateSequenceBoundary(boundaries)).toEqual(returnBoundary);
  });
});

describe('calculateIfElseBoundary', () => {
  let conditionBoundary, choiceBoundary, ifBoundary, elseBoundary;
  beforeEach(() => {
    conditionBoundary = new Boundary(280, 80);
    choiceBoundary = new Boundary(50, 20);
    ifBoundary = new Boundary(280, 80);
    elseBoundary = new Boundary(280, 80);
  });
  it('should return an new boundary when input conditionBoundary or choiceBoundary is empty', () => {
    expect(calculateIfElseBoundary(null, boundary, boundary, boundary)).toEqual(boundary);
    expect(calculateIfElseBoundary(boundary, null, boundary, boundary)).toEqual(boundary);
  });
  it('should return a box whose size be calcalated by conditionBoundary, choiceBoundary, ifBoundary and elseBoundary', () => {
    const bdWithBothBranch = calculateIfElseBoundary(conditionBoundary, choiceBoundary, ifBoundary, elseBoundary);
    const bdWithIfBranch = calculateIfElseBoundary(conditionBoundary, choiceBoundary, ifBoundary, new Boundary());
    const bdWithElseBranch = calculateIfElseBoundary(conditionBoundary, choiceBoundary, new Boundary(), elseBoundary);
    const bdWithNoBranch = calculateForeachBoundary(conditionBoundary, choiceBoundary, new Boundary(), new Boundary());

    expect(bdWithBothBranch.height).toEqual(bdWithIfBranch.height);
    expect(bdWithIfBranch.height).toEqual(bdWithElseBranch.height);

    expect(bdWithBothBranch.height - bdWithNoBranch.height).toEqual(ifBoundary.height);
    expect(bdWithBothBranch.height).toBeGreaterThan(
      conditionBoundary.height + choiceBoundary.height + Math.max(ifBoundary.height, elseBoundary.height)
    );
    expect(bdWithBothBranch.width).toBeGreaterThan(ifBoundary.width + elseBoundary.width);
  });
});

describe('calculateSwitchCaseBoundary', () => {
  let conditionBoundary, choiceBoundary, branchBoundaries;
  beforeEach(() => {
    conditionBoundary = new Boundary(280, 80);
    choiceBoundary = new Boundary(50, 20);
    branchBoundaries = [new Boundary(280, 80), new Boundary(300, 80)];
  });
  it('should return an new boundary when input conditionBoundary or choiceBoundary is empty', () => {
    expect(calculateSwitchCaseBoundary(null, boundary, [])).toEqual(boundary);
  });
  it('should return a box whose property be calcalated by conditionBoundary, choiceBoundary, branchBoundaries', () => {
    const returnBoundary = {
      width: 580 + BranchIntervalX * 2,
      height: 180 + BranchIntervalY * 3,
      axisX: 140,
      axisY: 0,
    };
    expect(calculateSwitchCaseBoundary(conditionBoundary, choiceBoundary, branchBoundaries)).toEqual(returnBoundary);
  });
});

describe('calculateForeachBoundary', () => {
  let foreachBoundary, stepsBoundary, loopBeginBoundary, loopEndBoundary;
  beforeEach(() => {
    foreachBoundary = new Boundary(280, 80);
    stepsBoundary = new Boundary(380, 100);
    loopBeginBoundary = new Boundary(24, 24);
    loopEndBoundary = new Boundary(24, 24);
  });
  it('should return an new boundary when input foreachBoundary or stepsBoundary is empty array', () => {
    expect(calculateForeachBoundary(null, boundary, boundary, boundary)).toEqual(boundary);
    expect(calculateForeachBoundary(boundary, null, boundary, boundary)).toEqual(boundary);
  });
  it('should return a box whose property be calcalated by foreachBoundary, stepsBoundary, loopBeginBoundary, loopEndBoundary', () => {
    const returnBoundary = {
      width: 380 + LoopEdgeMarginLeft,
      height: 228 + BranchIntervalY * 3,
      axisX: 190 + LoopEdgeMarginLeft,
      axisY: 0,
    };
    expect(calculateForeachBoundary(foreachBoundary, stepsBoundary, loopBeginBoundary, loopEndBoundary)).toEqual(
      returnBoundary
    );
  });
});
