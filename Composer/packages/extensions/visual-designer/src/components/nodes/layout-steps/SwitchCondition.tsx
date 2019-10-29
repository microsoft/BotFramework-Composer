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

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { transformSwitchCondition } from '../../../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../../../layouters/switchCaseLayouter';
import { GraphNode } from '../../../models/GraphNode';
import { areBoundariesEqual } from '../../../models/Boundary';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { StepGroup } from '../../groups';
import { Diamond } from '../templates/Diamond';
import { ElementRenderer } from '../../renderers/ElementRenderer';
import { NodeProps, defaultNodeProps } from '../nodeProps';

const calculateNodeMap = (path, data) => {
  const result = transformSwitchCondition(data, path);
  if (!result) return {};

  const { condition, choice, branches } = result;
  return {
    conditionNode: GraphNode.fromIndexedJson(condition),
    choiceNode: GraphNode.fromIndexedJson(choice),
    branchNodes: branches.map(x => GraphNode.fromIndexedJson(x)),
  };
};

const calculateLayout = (nodeMap, boundaryMap) => {
  [nodeMap.conditionNode, nodeMap.choiceNode, ...nodeMap.branchNodes]
    .filter(x => !!x)
    .forEach(x => (x.boundary = boundaryMap[x.id] || x.boundary));

  return switchCaseLayouter(nodeMap.conditionNode, nodeMap.choiceNode, nodeMap.branchNodes);
};

export const SwitchCondition: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }) => {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const layout = useMemo(() => calculateLayout(initialNodeMap, boundaryMap), [initialNodeMap, boundaryMap]);
  const accumulatedPatches = {};

  const patchBoundary = (id, boundary) => {
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
  const conditionNode = nodeMap.conditionNode;
  const choiceNode = nodeMap.choiceNode;
  const branchNodes = nodeMap.branchNodes || [];

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={nodeMap && nodeMap.conditionNode.offset}>
        <ElementRenderer
          key={conditionNode.id}
          id={conditionNode.id}
          data={conditionNode.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      <OffsetContainer offset={choiceNode.offset} css={{ zIndex: 100 }}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      {(branchNodes as any).map(x => (
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
      ))}
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};

SwitchCondition.defaultProps = defaultNodeProps;
