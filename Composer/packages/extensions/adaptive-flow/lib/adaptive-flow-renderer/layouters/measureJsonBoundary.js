// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { Boundary } from '../models/Boundary';
import {
  StandardNodeWidth,
  HeaderHeight,
  DiamondSize,
  InitNodeSize,
  LoopIconSize,
  ChoiceInputSize,
  ChoiceInputMarginTop,
  ChoiceInputMarginBottom,
  IconBrickSize,
  AssignmentMarginTop,
  PropertyAssignmentSize,
  AssignmentMarginBottom,
} from '../constants/ElementSizes';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { transformForeach } from '../transformers/transformForeach';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { designerCache } from '../utils/visual/DesignerCache';
import {
  calculateIfElseBoundary,
  calculateSequenceBoundary,
  calculateSwitchCaseBoundary,
  calculateForeachBoundary,
  calculateBaseInputBoundary,
} from './calculateNodeBoundary';
function measureStepGroupBoundary(stepGroup) {
  var boundaries = (stepGroup.children || []).map(function (x) {
    return measureJsonBoundary(x);
  });
  return calculateSequenceBoundary(boundaries);
}
function measureForeachBoundary(json) {
  var result = transformForeach(json, '');
  if (!result) return new Boundary();
  var foreachDetail = result.foreachDetail,
    stepGroup = result.stepGroup,
    loopBegin = result.loopBegin,
    loopEnd = result.loopEnd;
  var inputs = [foreachDetail, stepGroup, loopBegin, loopEnd].map(function (x) {
    return measureJsonBoundary(x.json);
  });
  return calculateForeachBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}
function measureIfConditionBoundary(json) {
  var result = transformIfCondtion(json, '');
  if (!result) return new Boundary();
  var condition = result.condition,
    choice = result.choice,
    ifGroup = result.ifGroup,
    elseGroup = result.elseGroup;
  var inputs = [condition, choice, ifGroup, elseGroup].map(function (x) {
    return measureJsonBoundary(x.json);
  });
  return calculateIfElseBoundary(inputs[0], inputs[1], inputs[2], inputs[3]);
}
function measureSwitchConditionBoundary(json) {
  var result = transformSwitchCondition(json, '');
  if (result === null) return new Boundary();
  var condition = result.condition,
    choice = result.choice,
    branches = result.branches;
  return calculateSwitchCaseBoundary(
    measureJsonBoundary(condition.json),
    measureJsonBoundary(choice.json),
    branches.map(function (x) {
      return measureJsonBoundary(x.json);
    })
  );
}
export function measureChoiceInputDetailBoundary(data) {
  var width = InitNodeSize.width;
  var height =
    InitNodeSize.height +
    (data.choices && Array.isArray(data.choices)
      ? data.choices.length < 4
        ? data.choices.length * (ChoiceInputSize.height + ChoiceInputMarginTop) + ChoiceInputMarginBottom
        : 4 * (ChoiceInputSize.height + ChoiceInputMarginTop)
      : 0);
  return new Boundary(width, height);
}
export function measurePropertyAssignmentBoundary(data) {
  var width = InitNodeSize.width;
  var height = Math.max(
    InitNodeSize.height / 2 +
      (data.assignments && Array.isArray(data.assignments)
        ? (data.assignments.length < 4
            ? data.assignments.length * (PropertyAssignmentSize.height + AssignmentMarginTop)
            : 4 * (PropertyAssignmentSize.height + AssignmentMarginTop)) + AssignmentMarginBottom
        : 0),
    InitNodeSize.height
  );
  return new Boundary(width, height);
}
function measureBaseInputBoundary(data) {
  var _a = transformBaseInput(data, ''),
    botAsks = _a.botAsks,
    userAnswers = _a.userAnswers;
  return calculateBaseInputBoundary(measureJsonBoundary(botAsks.json), measureJsonBoundary(userAnswers.json));
}
export function measureJsonBoundary(json) {
  var boundary = new Boundary();
  if (!json || !json.$kind) return boundary;
  var cachedBoundary = designerCache.loadBounary(json);
  if (cachedBoundary) {
    return cachedBoundary;
  }
  switch (json.$kind) {
    case AdaptiveKinds.ChoiceDiamond:
      boundary = new Boundary(DiamondSize.width, DiamondSize.height);
      break;
    case AdaptiveKinds.ConditionNode:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
    case AdaptiveKinds.LoopIndicator:
      boundary = new Boundary(LoopIconSize.width, LoopIconSize.height);
      break;
    case AdaptiveKinds.StepGroup:
      boundary = measureStepGroupBoundary(json);
      break;
    case AdaptiveKinds.IfCondition:
      boundary = measureIfConditionBoundary(json);
      break;
    case AdaptiveKinds.SwitchCondition:
      boundary = measureSwitchConditionBoundary(json);
      break;
    case AdaptiveKinds.Foreach:
    case AdaptiveKinds.ForeachPage:
      boundary = measureForeachBoundary(json);
      break;
    case AdaptiveKinds.AttachmentInput:
    case AdaptiveKinds.ChoiceInput:
    case AdaptiveKinds.ConfirmInput:
    case AdaptiveKinds.DateTimeInput:
    case AdaptiveKinds.NumberInput:
    case AdaptiveKinds.TextInput:
      boundary = measureBaseInputBoundary(json);
      break;
    case AdaptiveKinds.ChoiceInputDetail:
      boundary = measureChoiceInputDetailBoundary(json);
      break;
    case AdaptiveKinds.InvalidPromptBrick:
      boundary = new Boundary(IconBrickSize.width, IconBrickSize.height);
      break;
    case AdaptiveKinds.SetProperties:
      boundary = measurePropertyAssignmentBoundary(json);
      break;
    case AdaptiveKinds.EndDialog:
    case AdaptiveKinds.EndTurn:
    case AdaptiveKinds.RepeatDialog:
    case AdaptiveKinds.CancelAllDialogs:
    case AdaptiveKinds.LogAction:
    case AdaptiveKinds.TraceActivity:
      boundary = new Boundary(StandardNodeWidth, HeaderHeight);
      break;
    default:
      boundary = new Boundary(InitNodeSize.width, InitNodeSize.height);
      break;
  }
  return boundary;
}
//# sourceMappingURL=measureJsonBoundary.js.map
