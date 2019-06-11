import { ObiTypes } from '../shared/ObiTypes';
import { DiamondSize, InitNodeSize, ElementInterval } from '../shared/elementSizes';
import { Boundary } from '../shared/Boundary';

function measureStepGroupBoundary(stepGroup) {
  const children = stepGroup.children || [];
  const accumulatedHeight =
    children.length * InitNodeSize.height + Math.max(0, children.length - 1) * ElementInterval.y;
  return new Boundary(InitNodeSize.width, accumulatedHeight);
}

export function measureNodeBoundary(json) {
  let boundary = new Boundary();
  if (!json || !json.$type) return boundary;

  switch (json.$type) {
    case ObiTypes.ChoiceDiamond:
      boundary = new Boundary(DiamondSize.width, DiamondSize.height);
      break;
    case ObiTypes.ConditionNode:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
    case ObiTypes.StepGroup:
      boundary = measureStepGroupBoundary(json);
      break;
    default:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
  }
  return boundary;
}
