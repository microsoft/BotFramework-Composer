import { GraphLayout } from '../models/GraphLayout';
import { Boundary } from '../models/Boundary';
import { InitNodeSize, ElementInterval, DiamondSize } from '../constants/ElementSizes';
import { EdgeData } from '../models/EdgeData';

import { calculateTextInputBoundary } from './calculateNodeBoundary';

const TextInputBoundary = calculateTextInputBoundary(new Boundary(InitNodeSize.width, InitNodeSize.height));
const Row2BaselineY = InitNodeSize.height + ElementInterval.y / 2;
const Row2OffsetY = Row2BaselineY + ElementInterval.y / 2;
const DiamondOffsetX = TextInputBoundary.axisX - DiamondSize.width / 2;

export function textInputLayouter(id: string): GraphLayout {
  const baseNode = { id, data: {}, boundary: new Boundary(InitNodeSize.width, InitNodeSize.height) };
  const baseDiamond = { id, data: {}, boundary: new Boundary(DiamondSize.width, DiamondSize.height) };

  const initPrompt = {
    ...baseNode,
    offset: { x: 0, y: 0 },
  };
  const propertyBox = {
    ...baseNode,
    offset: { x: 0, y: Row2OffsetY },
  };
  const unrecognizedPrompt = {
    ...baseNode,
    offset: { x: InitNodeSize.width + ElementInterval.x, y: Row2OffsetY },
  };
  const invalidPrompt = {
    ...baseNode,
    offset: { x: InitNodeSize.width * 2 + ElementInterval.x * 2, y: Row2OffsetY },
  };
  const diamond1 = {
    ...baseDiamond,
    offset: { x: DiamondOffsetX, y: Row2OffsetY + InitNodeSize.height + ElementInterval.y / 2 },
  };
  const diamond2 = {
    ...baseDiamond,
    offset: {
      x: DiamondOffsetX,
      y: Row2OffsetY + InitNodeSize.height + ElementInterval.y / 2 + DiamondSize.height + ElementInterval.y / 2,
    },
  };

  const nodeMap = {
    initPrompt,
    propertyBox,
    unrecognizedPrompt,
    invalidPrompt,
    diamond1,
    diamond2,
  };

  const edges: EdgeData[] = [
    {
      id: `edge/${id}/row1->row2`,
      direction: 'y',
      x: TextInputBoundary.axisX,
      y: initPrompt.offset.y + initPrompt.boundary.height,
      length: ElementInterval.y,
    },
    {
      id: `edge/${id}/row2->diamond1`,
      direction: 'y',
      x: TextInputBoundary.axisX,
      y: propertyBox.offset.y + propertyBox.boundary.height,
      length: ElementInterval.y / 2,
    },
    {
      id: `edge/${id}/diamond1->diamond2`,
      direction: 'y',
      x: TextInputBoundary.axisX,
      y: diamond1.offset.y + diamond1.boundary.height,
      length: ElementInterval.y / 2,
    },
    {
      id: `edge/${id}/row2-baseline`,
      direction: 'x',
      x: TextInputBoundary.axisX,
      y: Row2BaselineY,
      length: invalidPrompt.offset.x + invalidPrompt.boundary.axisX - TextInputBoundary.axisX,
      invertDirected: true,
    },
    {
      id: `edge/${id}/row2-baseline->unrecognizedPrompt`,
      direction: 'y',
      x: unrecognizedPrompt.offset.x + unrecognizedPrompt.boundary.axisX,
      y: Row2BaselineY,
      length: ElementInterval.y / 2,
    },
    {
      id: `edge/${id}/row2-baseline->invalidPrompt`,
      direction: 'y',
      x: invalidPrompt.offset.x + invalidPrompt.boundary.axisX,
      y: Row2BaselineY,
      length: ElementInterval.y / 2,
    },
    {
      id: `edge/${id}/diamond1-baseline|unrecognizedPrompt`,
      direction: 'x',
      x: TextInputBoundary.axisX,
      y: diamond1.offset.y + diamond1.boundary.axisY,
      length: unrecognizedPrompt.offset.x + unrecognizedPrompt.boundary.axisX - TextInputBoundary.axisX,
    },
    {
      id: `edge/${id}/diamon1-baseline->unrecognizedPrompt`,
      direction: 'y',
      x: unrecognizedPrompt.offset.x + unrecognizedPrompt.boundary.axisX,
      y: unrecognizedPrompt.offset.y + unrecognizedPrompt.boundary.height,
      length:
        diamond1.offset.y +
        diamond1.boundary.axisY -
        (unrecognizedPrompt.offset.y + unrecognizedPrompt.boundary.height),
      invertDirected: true,
    },
    {
      id: `edge/${id}/diamond2-baseline|invalidPrompt`,
      direction: 'x',
      x: TextInputBoundary.axisX,
      y: diamond2.offset.y + diamond2.boundary.axisY,
      length: invalidPrompt.offset.x + invalidPrompt.boundary.axisX - TextInputBoundary.axisX,
    },
    {
      id: `edge/${id}/diamon2-baseline->invalidPrompt`,
      direction: 'y',
      x: invalidPrompt.offset.x + invalidPrompt.boundary.axisX,
      y: invalidPrompt.offset.y + invalidPrompt.boundary.height,
      length: diamond2.offset.y + diamond2.boundary.axisY - (invalidPrompt.offset.y + invalidPrompt.boundary.height),
      invertDirected: true,
    },
  ];

  return {
    boundary: TextInputBoundary,
    nodeMap,
    edges,
    nodes: [],
  };
}
