import { ObiTypes } from '../shared/ObiTypes';
import { Boundary } from '../shared/Boundary';
import { GraphNode } from '../shared/GraphNode';
import { DiamondSize, InitNodeSize, LoopIconSize } from '../shared/elementSizes';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { transformForeach } from '../transformers/transformForeach';

import {
  calculateIfElseBoundary,
  calculateSequenceBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
} from './calculateNodeBoundary';

function measureStepGroupBoundary(stepGroup) {
  const nodes = (stepGroup.children || []).map(x => GraphNode.fromIndexedJson(x));
  return calculateSequenceBoundary(nodes);
}

function measureForeachBoundary(json) {
  const { foreachDetail, stepGroup, loopBegin, loopEnd } = transformForeach(json, '');
  const inputs = [foreachDetail, stepGroup, loopBegin, loopEnd].map(x => GraphNode.fromIndexedJson(x));
  return calculateForeachBoundary(...inputs);
}

function measureIfConditionBoundary(json) {
  const { condition, choice, ifGroup, elseGroup } = transformIfCondtion(json, '');
  const inputs = [condition, choice, ifGroup, elseGroup].map(x => GraphNode.fromIndexedJson(x));
  inputs[2]!.boundary = measureStepGroupBoundary(ifGroup.json);
  inputs[3]!.boundary = measureStepGroupBoundary(elseGroup.json);
  const result = calculateIfElseBoundary(...inputs);
  return result;
}

function measureSwitchConditionBoundary(json) {
  const { condition, choice, branches } = transformSwitchCondition(json, '');
  return calculateSwitchCaseBoundary(
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
    case ObiTypes.LoopIndicator:
      boundary = new Boundary(LoopIconSize.width, LoopIconSize.height);
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
    case ObiTypes.Foreach:
      boundary = measureForeachBoundary(json);
      break;
    default:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
  }
  return boundary;
}
