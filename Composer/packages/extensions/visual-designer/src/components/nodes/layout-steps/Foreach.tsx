/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useEffect, useState, FunctionComponent } from 'react';

import { transformForeach } from '../../../transformers/transformForeach';
import { foreachLayouter } from '../../../layouters/foreachLayouter';
import { areBoundariesEqual } from '../../../models/Boundary';
import { GraphNode } from '../../../models/GraphNode';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { LoopIndicator } from '../../decorations/LoopIndicator';
import { DefaultRenderer } from '../steps/DefaultRenderer';
import { StepGroup } from '../../groups';
import { NodeProps, defaultNodeProps } from '../nodeProps';

const calculateNodeMap = (jsonpath, data): { [id: string]: GraphNode } => {
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

const calculateLayout = (nodeMap, boundaryMap) => {
  (Object.values(nodeMap) as GraphNode[])
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
  if (!nodeMap) {
    return null;
  }

  const { foreachNode, stepsNode, loopBeginNode, loopEndNode } = nodeMap;
  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={foreachNode.offset}>
        <DefaultRenderer key={foreachNode.id} id={foreachNode.id} data={foreachNode.data} onEvent={onEvent} />
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
            <LoopIndicator onClick={() => onEvent(NodeEventTypes.Focus, id)} />
          </OffsetContainer>
        ))}
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};

Foreach.defaultProps = defaultNodeProps;
