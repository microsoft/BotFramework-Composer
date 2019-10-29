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
import { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { transformIfCondtion } from '../../../transformers/transformIfCondition';
import { ifElseLayouter } from '../../../layouters/ifelseLayouter';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { GraphNode } from '../../../models/GraphNode';
import { areBoundariesEqual, Boundary } from '../../../models/Boundary';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { StepGroup } from '../../groups';
import { Diamond } from '../templates/Diamond';
import { ElementRenderer } from '../../renderers/ElementRenderer';
import { NodeProps, defaultNodeProps } from '../nodeProps';

import { NodeMap, BoundaryMap } from './types';

const calculateNodeMap = (path, data): NodeMap => {
  const result = transformIfCondtion(data, path);
  if (!result) return {};

  const { condition, choice, ifGroup, elseGroup } = result;
  return {
    conditionNode: GraphNode.fromIndexedJson(condition),
    choiceNode: GraphNode.fromIndexedJson(choice),
    ifGroupNode: GraphNode.fromIndexedJson(ifGroup),
    elseGroupNode: GraphNode.fromIndexedJson(elseGroup),
  };
};

const calculateLayout = (nodeMap: NodeMap, boundaryMap: BoundaryMap) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach((x: GraphNode) => (x.boundary = boundaryMap[x.id] || x.boundary));

  return ifElseLayouter(nodeMap.conditionNode, nodeMap.choiceNode, nodeMap.ifGroupNode, nodeMap.elseGroupNode);
};

export const IfCondition: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }) => {
  const [boundaryMap, setBoundaryMap] = useState<BoundaryMap>({});
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
  const condition = nodeMap.condition || new GraphNode();
  const choice = nodeMap.choice || new GraphNode();

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={condition.offset}>
        <ElementRenderer
          key={condition.id}
          id={condition.id}
          data={condition.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      <OffsetContainer offset={choice.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      {nodeMap
        ? [nodeMap.if, nodeMap.else]
            .filter(x => !!x)
            .map(x => (
              <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
                <StepGroup
                  key={x.id}
                  id={x.id}
                  data={x.data}
                  onEvent={onEvent}
                  onResize={size => {
                    patchBoundary(x.id, size);
                  }}
                />
              </OffsetContainer>
            ))
        : null}
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};

IfCondition.defaultProps = defaultNodeProps;
