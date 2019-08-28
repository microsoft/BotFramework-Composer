/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../nodeProps';
import { GraphNode } from '../../../models/GraphNode';
import { transformSwitchCondition } from '../../../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../../../layouters/switchCaseLayouter';
import { areBoundariesEqual } from '../../../models/Boundary';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { StepGroup } from '../../groups';
import { Diamond } from '../templates/Diamond';
import { DefaultRenderer } from '../steps/DefaultRenderer';

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
        <DefaultRenderer key={conditionNode.id} id={conditionNode.id} data={conditionNode.data} onEvent={onEvent} />
      </OffsetContainer>
      <OffsetContainer offset={choiceNode.offset} css={{ zIndex: 100 }}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, id);
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
