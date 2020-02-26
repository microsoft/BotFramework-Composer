// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiTypes } from '../constants/ObiTypes';
import { Boundary } from '../models/Boundary';
import {
  DiamondSize,
  InitNodeSize,
  LoopIconSize,
  ChoiceInputSize,
  ChoiceInputMarginTop,
  ChoiceInputMarginBottom,
  IconBrickSize,
} from '../constants/ElementSizes';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { transformForeach } from '../transformers/transformForeach';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { designerCache } from '../store/DesignerCache';

import {
  calculateIfElseBoundary,
  calculateSequenceBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
  calculateBaseInputBoundary,
} from './calculateNodeBoundary';

function measureStepGroupBoundary(stepGroup): Boundary {
  const boundaries = (stepGroup.children || []).map(x => measureJsonBoundary(x));
  return calculateSequenceBoundary(boundaries);
}

function measureForeachBoundary(json): Boundary {
  const result = transformForeach(json, '');
  if (!result) return new Boundary();

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;
  const inputs: Boundary[] = [foreachDetail, stepGroup, loopBegin, loopEnd].map(x => measureJsonBoundary(x.json));
  return calculateForeachBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}

function measureIfConditionBoundary(json): Boundary {
  const result = transformIfCondtion(json, '');
  if (!result) return new Boundary();

  const { condition, choice, ifGroup, elseGroup } = result;
  const inputs: Boundary[] = [condition, choice, ifGroup, elseGroup].map(x => measureJsonBoundary(x.json));
  return calculateIfElseBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}

function measureSwitchConditionBoundary(json): Boundary {
  const result = transformSwitchCondition(json, '');
  if (result === null) return new Boundary();

  const { condition, choice, branches } = result;
  return calculateSwitchCaseBoundary(
    measureJsonBoundary(condition.json),
    measureJsonBoundary(choice.json),
    branches.map(x => measureJsonBoundary(x.json))
  );
}

export function measureChoiceInputDetailBoundary(data): Boundary {
  const width = InitNodeSize.width;
  const height =
    InitNodeSize.height +
    (data.choices && Array.isArray(data.choices)
      ? data.choices.length < 4
        ? data.choices.length * (ChoiceInputSize.height + ChoiceInputMarginTop) + ChoiceInputMarginBottom
        : 4 * (ChoiceInputSize.height + ChoiceInputMarginTop)
      : 0);
  return new Boundary(width, height);
}

function measureBaseInputBoundary(data): Boundary {
  const { botAsks, userAnswers } = transformBaseInput(data, '');
  return calculateBaseInputBoundary(measureJsonBoundary(botAsks.json), measureJsonBoundary(userAnswers.json));
}

export function measureJsonBoundary(json): Boundary {
  let boundary = new Boundary();
  if (!json || !json.$type) return boundary;

  const cachedBoundary = designerCache.loadBounary(json);
  if (cachedBoundary) {
    return cachedBoundary;
  }

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
    case ObiTypes.ForeachPage:
      boundary = measureForeachBoundary(json);
      break;
    case ObiTypes.AttachmentInput:
    case ObiTypes.ChoiceInput:
    case ObiTypes.ConfirmInput:
    case ObiTypes.DateTimeInput:
    case ObiTypes.NumberInput:
    case ObiTypes.TextInput:
      boundary = measureBaseInputBoundary(json);
      break;
    case ObiTypes.ChoiceInputDetail:
      boundary = measureChoiceInputDetailBoundary(json);
      break;
    case ObiTypes.InvalidPromptBrick:
      boundary = new Boundary(IconBrickSize.width, IconBrickSize.height);
      break;
    default:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
  }
  return boundary;
}
