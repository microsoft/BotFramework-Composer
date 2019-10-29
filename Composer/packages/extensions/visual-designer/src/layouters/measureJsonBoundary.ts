/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { ObiTypes } from '../constants/ObiTypes';
import { Boundary } from '../models/Boundary';
import {
  DiamondSize,
  InitNodeSize,
  LoopIconSize,
  ChoiceInputSize,
  ChoiceInputMarginTop,
  IconBrickSize,
} from '../constants/ElementSizes';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { transformForeach } from '../transformers/transformForeach';
import { transformBaseInput } from '../transformers/transformBaseInput';

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

function measureChoiceInputDetailBoundary(data): Boundary {
  const width = InitNodeSize.width;
  const height =
    InitNodeSize.height +
    (data.choices
      ? (data.choices.length <= 4 ? data.choices.length : 4) * (ChoiceInputSize.height + ChoiceInputMarginTop)
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
    case ObiTypes.OAuthInput:
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
