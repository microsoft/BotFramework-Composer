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
import { GraphLayout } from '../models/GraphLayout';
import { EdgeData } from '../models/EdgeData';
import { ElementInterval, LoopEdgeMarginLeft } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';

import { calculateBaseInputBoundary } from './calculateNodeBoundary';

/**
 *         |
 *     [Bot Asks]
 *         |-------------------
 *   [User Answers]    [invalidPrompt]
 *         |-------------------
 */
export function baseInputLayouter(
  botAsksNode: GraphNode,
  userAnswersNode: GraphNode,
  invalidPromptNode: GraphNode
): GraphLayout {
  const boundary = calculateBaseInputBoundary(botAsksNode.boundary, userAnswersNode.boundary);

  botAsksNode.offset = { x: boundary.axisX - botAsksNode.boundary.axisX, y: 0 };
  userAnswersNode.offset = {
    x: boundary.axisX - userAnswersNode.boundary.axisX,
    y: botAsksNode.offset.y + botAsksNode.boundary.height + ElementInterval.y,
  };
  invalidPromptNode.offset = {
    x: userAnswersNode.offset.x + userAnswersNode.boundary.width + LoopEdgeMarginLeft,
    y: userAnswersNode.offset.y + userAnswersNode.boundary.axisY - invalidPromptNode.boundary.axisY,
  };

  const baseline1OffsetY = botAsksNode.offset.y + botAsksNode.boundary.height + ElementInterval.y / 2;
  const baseline2OffsetY = userAnswersNode.offset.y + userAnswersNode.boundary.height + ElementInterval.y / 2;
  const baselineLength = invalidPromptNode.offset.x + invalidPromptNode.boundary.axisX - boundary.axisX;

  const edges: EdgeData[] = [
    {
      id: `edges/${botAsksNode.id}/botAsks->userAnswers`,
      direction: 'y',
      x: boundary.axisX,
      y: botAsksNode.boundary.height,
      length: ElementInterval.y,
    },
    {
      id: `edges/${botAsksNode.id}/userAnswers->bottom`,
      direction: 'y',
      x: boundary.axisX,
      y: userAnswersNode.offset.y + userAnswersNode.boundary.height,
      length: ElementInterval.y / 2,
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline1->iconNode|`,
      direction: 'x',
      x: boundary.axisX,
      y: baseline1OffsetY,
      length: baselineLength,
      dashed: true,
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline2->iconNode|`,
      direction: 'x',
      x: boundary.axisX,
      y: baseline2OffsetY,
      length: baselineLength,
      dashed: true,
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline1->iconNode`,
      direction: 'y',
      x: invalidPromptNode.offset.x + invalidPromptNode.boundary.axisX,
      y: baseline1OffsetY,
      length: invalidPromptNode.offset.y - baseline1OffsetY,
      dashed: true,
    },
    {
      id: `edges/${invalidPromptNode.id}/iconNode->baseline2`,
      direction: 'y',
      x: invalidPromptNode.offset.x + invalidPromptNode.boundary.axisX,
      y: invalidPromptNode.offset.y + invalidPromptNode.boundary.height,
      length: baseline2OffsetY - (invalidPromptNode.offset.y + invalidPromptNode.boundary.height),
      dashed: true,
    },
  ];

  return {
    boundary,
    nodeMap: {
      botAsksNode,
      userAnswersNode,
      invalidPromptNode,
    },
    edges,
    nodes: [],
  };
}
