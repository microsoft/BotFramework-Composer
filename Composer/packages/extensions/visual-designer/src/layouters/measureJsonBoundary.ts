import { ObiTypes } from '../shared/ObiTypes';
import { Boundary } from '../shared/Boundary';
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

function measureStepGroupBoundary(stepGroup): Boundary {
  const boundaries = (stepGroup.children || []).map(x => measureJsonBoundary(x));
  return calculateSequenceBoundary(boundaries);
}

function measureForeachBoundary(json): Boundary {
  const { foreachDetail, stepGroup, loopBegin, loopEnd } = transformForeach(json, '');
  const inputs: Boundary[] = [foreachDetail, stepGroup, loopBegin, loopEnd].map(x => measureJsonBoundary(x.json));
  return calculateForeachBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}

function measureIfConditionBoundary(json): Boundary {
  const { condition, choice, ifGroup, elseGroup } = transformIfCondtion(json, '');
  const inputs: Boundary[] = [condition, choice, ifGroup, elseGroup].map(x => measureJsonBoundary(x.json));
  return calculateIfElseBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}

function measureSwitchConditionBoundary(json): Boundary {
  const { condition, choice, branches } = transformSwitchCondition(json, '');
  return calculateSwitchCaseBoundary(
    measureJsonBoundary(condition.json),
    measureJsonBoundary(choice.json),
    branches.map(x => measureJsonBoundary(x.json))
  );
}

export function measureJsonBoundary(json): Boundary {
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
