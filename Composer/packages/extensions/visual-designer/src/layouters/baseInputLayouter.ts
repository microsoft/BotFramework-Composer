import { GraphLayout } from '../models/GraphLayout';
import { Boundary } from '../models/Boundary';
import { EdgeData } from '../models/EdgeData';
import { ElementInterval, IconBrickSize, LoopEdgeMarginLeft } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';

import { calculateBaseInputBoundary } from './calculateNodeBoundary';

/**
 *         |
 *     [Bot Asks]
 *         |
 *         |------------
 *   [User Answers]    |
 *   [____________]    x
 *         |------------
 */
export function baseInputLayouter(botAsksNode: GraphNode, userAnswersNode: GraphNode): GraphLayout {
  const boundary = calculateBaseInputBoundary(botAsksNode.boundary, userAnswersNode.boundary);

  botAsksNode.offset = { x: boundary.axisX - botAsksNode.boundary.axisX, y: 0 };
  userAnswersNode.offset = {
    x: boundary.axisX - userAnswersNode.boundary.axisX,
    y: botAsksNode.offset.y + botAsksNode.boundary.height + ElementInterval.y,
  };

  const iconNode = {
    id: botAsksNode.id,
    data: {},
    boundary: new Boundary(IconBrickSize.width, IconBrickSize.height),
    offset: {
      x: userAnswersNode.offset.x + userAnswersNode.boundary.width + LoopEdgeMarginLeft,
      y: userAnswersNode.offset.y + userAnswersNode.boundary.axisY - IconBrickSize.height / 2,
    },
  };

  const baseline1OffsetY = botAsksNode.offset.y + botAsksNode.boundary.height + ElementInterval.y / 2;
  const baseline2OffsetY = userAnswersNode.offset.y + userAnswersNode.boundary.height + ElementInterval.y / 2;
  const baselineLength = iconNode.offset.x + iconNode.boundary.axisX - boundary.axisX;

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
      id: `edges/${iconNode.id}/baseline1->iconNode|`,
      direction: 'x',
      x: boundary.axisX,
      y: baseline1OffsetY,
      length: baselineLength,
      dashed: true,
    },
    {
      id: `edges/${iconNode.id}/baseline2->iconNode|`,
      direction: 'x',
      x: boundary.axisX,
      y: baseline2OffsetY,
      length: baselineLength,
      dashed: true,
    },
    {
      id: `edges/${iconNode.id}/baseline1->iconNode`,
      direction: 'y',
      x: iconNode.offset.x + iconNode.boundary.axisX,
      y: baseline1OffsetY,
      length: iconNode.offset.y - iconNode.boundary.axisY - baseline1OffsetY,
      dashed: true,
    },
    {
      id: `edges/${iconNode.id}/iconNode->baseline2`,
      direction: 'y',
      x: iconNode.offset.x + iconNode.boundary.axisX,
      y: iconNode.offset.y + iconNode.boundary.height,
      length: baseline2OffsetY - (iconNode.offset.y + iconNode.boundary.height),
      dashed: true,
    },
  ];

  return {
    boundary,
    nodeMap: {
      botAsksNode,
      userAnswersNode,
      iconNode,
    },
    edges,
    nodes: [],
  };
}
