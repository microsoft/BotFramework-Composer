import React, { useMemo, useEffect, useState, FunctionComponent } from 'react';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { transformForeach } from '../../transformers/transformForeach';
import { GraphNode } from '../../shared/GraphNode';
import { foreachLayouter } from '../../layouters/foreachLayouter';
import { areBoundariesEqual } from '../../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { OffsetContainer } from '../../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { DefaultRenderer } from './DefaultRenderer';
import { LoopIndicator } from './templates/LoopIndicator';
import { NodeEventTypes } from '../../shared/NodeEventTypes';

const calculateNodeMap = (jsonpath, data) => {
  const { foreachDetail, stepGroup, loopBegin, loopEnd } = transformForeach(data, jsonpath);
  return {
    foreachNode: GraphNode.fromIndexedJson(foreachDetail),
    stepGroupNode: GraphNode.fromIndexedJson(stepGroup),
    loopBeginNode: GraphNode.fromIndexedJson(loopBegin),
    loopEndNode: GraphNode.fromIndexedJson(loopEnd),
  };
};

const calculateLayout = (nodeMap, boundaryMap) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach((x: any) => (x.boundary = boundaryMap[x.id] || x.boundary));

  return foreachLayouter(nodeMap.foreachNode, nodeMap.stepGroupNode, nodeMap.loopBeginNode, nodeMap.loopEndNode);
};

export const Foreach: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent, onResize }) => {
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
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={foreachNode.offset}>
        <DefaultRenderer
          key={foreachNode.id}
          id={foreachNode.id}
          data={foreachNode.data}
          focusedId={focusedId}
          onEvent={onEvent}
        />
      </OffsetContainer>
      <OffsetContainer offset={stepsNode.offset}>
        <StepGroup
          key={stepsNode.id}
          id={stepsNode.id}
          data={stepsNode.data}
          focusedId={focusedId}
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
