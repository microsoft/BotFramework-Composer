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
import { useState, useMemo, useEffect, FunctionComponent } from 'react';

import { GraphNode } from '../../models/GraphNode';
import { areBoundariesEqual } from '../../models/Boundary';
import { sequentialLayouter } from '../../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../../constants/ElementSizes';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { transformStepGroup } from '../../transformers/transformStepGroup';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { OffsetContainer } from '../lib/OffsetContainer';
import { StepRenderer } from '../renderers/StepRenderer';
import { Edge } from '../lib/EdgeComponents';
import { GraphLayout } from '../../models/GraphLayout';
import { EdgeMenu } from '../menus/EdgeMenu';

const StepInterval = ElementInterval.y;

const calculateNodes = (groupId: string, data): GraphNode[] => {
  const steps = transformStepGroup(data, groupId);
  return steps.map((x): GraphNode => GraphNode.fromIndexedJson(x));
};

const calculateLayout = (nodes, boundaryMap): GraphLayout => {
  nodes.forEach((x): void => (x.boundary = boundaryMap[x.id] || x.boundary));
  return sequentialLayouter(nodes);
};

export const StepGroup: FunctionComponent<NodeProps> = ({ id, data, onEvent, onResize }: NodeProps): JSX.Element => {
  const [boundaryMap, setBoundaryMap] = useState({});
  const initialNodes = useMemo((): GraphNode[] => calculateNodes(id, data), [id, data]);
  const layout = useMemo((): GraphLayout => calculateLayout(initialNodes, boundaryMap), [initialNodes, boundaryMap]);
  const accumulatedPatches = {};

  const patchBoundary = (id, boundary): void => {
    if (!boundaryMap[id] || !areBoundariesEqual(boundaryMap[id], boundary)) {
      accumulatedPatches[id] = boundary;
      setBoundaryMap({
        ...boundaryMap,
        ...accumulatedPatches,
      });
    }
  };

  useEffect((): void => {
    onResize(layout.boundary);
  }, [layout]);

  const { boundary, nodes, edges } = layout;
  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
      {nodes
        ? nodes.map(x => (
            <OffsetContainer key={`stepGroup/${x.id}/offset`} offset={x.offset}>
              <StepRenderer
                key={`stepGroup/${x.id}`}
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
      <OffsetContainer
        offset={{ x: boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 }}
        css={{ zIndex: 100 }}
      >
        <EdgeMenu
          onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })}
          data-testid="StepGroupAdd"
          id={`${id}[0]`}
        />
      </OffsetContainer>
      {nodes
        ? nodes.map((x, idx) => (
            <OffsetContainer
              key={`stepGroup/${x.id}/footer/offset`}
              offset={{
                x: boundary.axisX - EdgeAddButtonSize.width / 2,
                y: x.offset.y + x.boundary.height + StepInterval / 2 - EdgeAddButtonSize.height / 2,
              }}
              css={{ zIndex: 100 }}
            >
              <EdgeMenu
                onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: idx + 1 })}
                data-testid="StepGroupAdd"
                id={`${id}[${idx + 1}]`}
              />
            </OffsetContainer>
          ))
        : null}
    </div>
  );
};
StepGroup.defaultProps = defaultNodeProps;
