// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useEffect, useState, FunctionComponent } from 'react';

import { transformForeach } from '../transformers/transformForeach';
import { foreachLayouter } from '../layouters/foreachLayouter';
import { areBoundariesEqual, Boundary } from '../models/Boundary';
import { GraphNode } from '../models/GraphNode';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { Edge } from '../components/lib/EdgeComponents';
import { LoopIndicator } from '../components/decorations/LoopIndicator';
import { StepGroup } from '../components/groups';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { NodeMap, BoundaryMap } from '../components/nodes/types';
import { WidgetContainerProps } from '../schema/uischema.types';

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

export interface ForeachWidgetProps extends WidgetContainerProps {
  loop: JSX.Element;
}

export const ForeachWidget: FunctionComponent<ForeachWidgetProps> = ({ id, data, onEvent, onResize, loop }) => {
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
        <ElementWrapper id={id} onEvent={onEvent}>
          {loop}
        </ElementWrapper>
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

ForeachWidget.defaultProps = {
  onResize: () => null,
};
