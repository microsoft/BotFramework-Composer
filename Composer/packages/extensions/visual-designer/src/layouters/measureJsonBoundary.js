import { ObiTypes } from '../shared/ObiTypes';
import { DiamondSize, InitNodeSize } from '../shared/elementSizes';
import { Boundary } from '../shared/Boundary';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { GraphNode } from '../shared/GraphNode';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';

import { measureIfElseBoundary, measureSeqenceBoundary, measureSwitchCaseBoundary } from './containerBoundaryMeasurer';

function measureStepGroupBoundary(stepGroup) {
  const nodes = (stepGroup.children || []).map(x => GraphNode.fromIndexedJson(x));
  return measureSeqenceBoundary(nodes);
}

function measureIfConditionBoundary(json) {
  const { condition, choice, ifGroup, elseGroup } = transformIfCondtion(json, '');
  const inputs = [condition, choice, ifGroup, elseGroup].map(x => GraphNode.fromIndexedJson(x));
  inputs[2].boundary = measureStepGroupBoundary(ifGroup.json);
  inputs[3].boundary = measureStepGroupBoundary(elseGroup.json);
  const result = measureIfElseBoundary(...inputs);
  return result;
}

function measureSwitchConditionBoundary(json) {
  const { condition, choice, branches } = transformSwitchCondition(json, '');
  return measureSwitchCaseBoundary(
    GraphNode.fromIndexedJson(condition),
    GraphNode.fromIndexedJson(choice),
    branches.map(x => GraphNode.fromIndexedJson(x))
  );
}

export function measureJsonBoundary(json) {
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
    case ObiTypes.IfCondition:
      boundary = measureIfConditionBoundary(json);
      break;
    case ObiTypes.SwitchCondition:
      boundary = measureSwitchConditionBoundary(json);
      break;
    default:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
  }
  return boundary;
}
