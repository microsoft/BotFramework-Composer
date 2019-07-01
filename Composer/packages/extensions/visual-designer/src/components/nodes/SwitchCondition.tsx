import React, { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphNode } from '../../shared/GraphNode';
import { OffsetContainer } from '../../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { areBoundariesEqual } from '../../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { transformSwitchCondition } from '../../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../../layouters/switchCaseLayouter';

import { Diamond } from './templates/Diamond';
import { DefaultRenderer } from './DefaultRenderer';

const calculateNodeMap = (path, data) => {
  const { condition, choice, branches } = transformSwitchCondition(data, path);
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

export const SwitchCondition: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent, onResize }) => {
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
  return (
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={nodeMap && nodeMap.conditionNode.offset}>
        <DefaultRenderer
          key={nodeMap && nodeMap.conditionNode.id}
          id={nodeMap && nodeMap.conditionNode.id}
          data={nodeMap && nodeMap.conditionNode.data}
          focusedId={focusedId}
          onEvent={onEvent}
        />
      </OffsetContainer>
      <OffsetContainer offset={nodeMap && nodeMap.choiceNode.offset} styles={{ zIndex: 100 }}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, id);
          }}
        />
      </OffsetContainer>
      {((nodeMap && nodeMap.branchNodes) || []).map(x => (
        <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
          <StepGroup
            key={x.id}
            id={x.id}
            data={x.data}
            focusedId={focusedId}
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
