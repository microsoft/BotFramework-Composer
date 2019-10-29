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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useEffect, useState, FunctionComponent } from 'react';

import { transformForeach } from '../../../transformers/transformForeach';
import { foreachLayouter } from '../../../layouters/foreachLayouter';
import { areBoundariesEqual, Boundary } from '../../../models/Boundary';
import { GraphNode } from '../../../models/GraphNode';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { LoopIndicator } from '../../decorations/LoopIndicator';
import { ElementRenderer } from '../../renderers/ElementRenderer';
import { StepGroup } from '../../groups';
import { NodeProps, defaultNodeProps } from '../nodeProps';

import { NodeMap, BoundaryMap } from './types';

const calculateNodeMap = (jsonpath, data): NodeMap => {
  const result = transformForeach(data, jsonpath);
  if (!result) return {};

  const { foreachDetail, stepGroup, loopBegin, loopEnd } = result;
  return {
    foreachNode: GraphNode.fromIndexedJson(foreachDetail),
    stepGroupNode: GraphNode.fromIndexedJson(stepGroup),
    loopBeginNode: GraphNode.fromIndexedJson(loopBegin),
    loopEndNode: GraphNode.fromIndexedJson(loopEnd),
  };
};

const calculateLayout = (nodeMap: NodeMap, boundaryMap: BoundaryMap) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach((x: GraphNode) => {
      x.boundary = boundaryMap[x.id] || x.boundary;
    });

  return foreachLayouter(nodeMap.foreachNode, nodeMap.stepGroupNode, nodeMap.loopBeginNode, nodeMap.loopEndNode);
};

export const Foreach: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }) => {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const layout = useMemo(() => calculateLayout(initialNodeMap, boundaryMap), [initialNodeMap, boundaryMap]);
  const accumulatedPatches = {};

  const patchBoundary = (id, boundary?: Boundary) => {
    if (!boundaryMap[id] || !areBoundariesEqual(boundaryMap[id], boundary)) {
      accumulatedPatches[id] = boundary;
      setBoundaryMap({
        ...boundaryMap,
        ...accumulatedPatches,
      });
    }
  };

  useEffect(() => {
    onResize(layout.boundary);
  }, [layout]);

  const { boundary, nodeMap, edges } = layout;
  if (!nodeMap) {
    return null;
  }

  const { foreachNode, stepsNode, loopBeginNode, loopEndNode } = nodeMap;
  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={foreachNode.offset}>
        <ElementRenderer
          key={foreachNode.id}
          id={foreachNode.id}
          data={foreachNode.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      <OffsetContainer offset={stepsNode.offset}>
        <StepGroup
          key={stepsNode.id}
          id={stepsNode.id}
          data={stepsNode.data}
          onEvent={onEvent}
          onResize={size => {
            patchBoundary(stepsNode.id, size);
          }}
        />
      </OffsetContainer>
      {[loopBeginNode, loopEndNode]
        .filter(x => !!x)
        .map((x, index) => (
          <OffsetContainer key={`${id}/loopicon-${index}/offset`} offset={x.offset}>
            <LoopIndicator onClick={() => onEvent(NodeEventTypes.Focus, { id })} />
          </OffsetContainer>
        ))}
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};

Foreach.defaultProps = defaultNodeProps;
