// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { GraphLayout } from '../models/GraphLayout';
import { Edge, EdgeDirection } from '../models/EdgeData';
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

  const edges: Edge[] = [
    {
      id: `edges/${botAsksNode.id}/botAsks->userAnswers`,
      direction: EdgeDirection.Down,
      x: boundary.axisX,
      y: botAsksNode.boundary.height,
      length: ElementInterval.y,
    },
    {
      id: `edges/${botAsksNode.id}/userAnswers->bottom`,
      direction: EdgeDirection.Down,
      x: boundary.axisX,
      y: userAnswersNode.offset.y + userAnswersNode.boundary.height,
      length: ElementInterval.y / 2,
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline1->iconNode|`,
      direction: EdgeDirection.Right,
      x: boundary.axisX,
      y: baseline1OffsetY,
      length: baselineLength,
      options: { dashed: true },
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline2->iconNode|`,
      direction: EdgeDirection.Right,
      x: boundary.axisX,
      y: baseline2OffsetY,
      length: baselineLength,
      options: { dashed: true },
    },
    {
      id: `edges/${invalidPromptNode.id}/baseline1->iconNode`,
      direction: EdgeDirection.Down,
      x: invalidPromptNode.offset.x + invalidPromptNode.boundary.axisX,
      y: baseline1OffsetY,
      length: invalidPromptNode.offset.y - baseline1OffsetY,
      options: { dashed: true },
    },
    {
      id: `edges/${invalidPromptNode.id}/iconNode->baseline2`,
      direction: EdgeDirection.Down,
      x: invalidPromptNode.offset.x + invalidPromptNode.boundary.axisX,
      y: invalidPromptNode.offset.y + invalidPromptNode.boundary.height,
      length: baseline2OffsetY - (invalidPromptNode.offset.y + invalidPromptNode.boundary.height),
      options: { dashed: true },
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
