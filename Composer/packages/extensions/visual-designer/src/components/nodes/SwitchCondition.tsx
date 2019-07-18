// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphNode } from '../../shared/GraphNode';
import { transformSwitchCondition } from '../../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../../layouters/switchCaseLayouter';
import { areBoundariesEqual } from '../../shared/Boundary';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Edge } from '../shared/EdgeComponents';
import { StepGroup } from '../groups';

import { Diamond } from './templates/Diamond';
import { DefaultRenderer } from './DefaultRenderer';

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

export const SwitchCondition: FunctionComponent<NodeProps> = ({
  id,
  data,
  focusedId,
  getLgTemplates,
  onEvent,
  onResize,
}) => {
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
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={nodeMap && nodeMap.conditionNode.offset}>
        <DefaultRenderer
          key={conditionNode.id}
          id={conditionNode.id}
          data={conditionNode.data}
          focusedId={focusedId}
          getLgTemplates={getLgTemplates}
          onEvent={onEvent}
        />
      </OffsetContainer>
      <OffsetContainer offset={choiceNode.offset} styles={{ zIndex: 100 }}>
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
            focusedId={focusedId}
            getLgTemplates={getLgTemplates}
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
