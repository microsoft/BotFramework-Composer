import React, { useEffect, useState, useMemo } from 'react';

import { NodeEventTypes } from '../../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { OffsetContainer } from '../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { Boundary, areBoundariesEqual } from '../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { transformSwitchCondition } from '../../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../../layouters/switchCaseLayouter';

import { Diamond } from './templates/Diamond';
import { NodeMenu } from './templates/NodeMenu';

const ChoiceNodeWidth = 50;
const ChoiceNodeHeight = 20;

const calculateNodeMap = (path, data) => {
  const { condition, cases } = transformSwitchCondition(data, path);
  return {
    switchNode: GraphNode.fromIndexedJson(condition),
    casesNodes: cases.map(x => GraphNode.fromIndexedJson(x)),
  };
};

const calculateLayout = (nodeMap, boundaryMap) => {
  nodeMap.casesNodes.forEach(x => (x.boundary = boundaryMap[x.id] || new Boundary()));
  if (nodeMap.switchNode) nodeMap.switchNode.boundary = new Boundary(ChoiceNodeWidth, ChoiceNodeHeight);

  return switchCaseLayouter(nodeMap.switchNode, nodeMap.casesNodes);
};

export const SwitchCondition = function({ id, data, focusedId, onEvent, onResize }) {
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
      <OffsetContainer offset={nodeMap.switchNode.offset}>
        <Diamond
          data-testid="SwitchConditionDiamond"
          onClick={() => {
            onEvent(NodeEventTypes.Focus, id);
          }}
        />
      </OffsetContainer>
      {(nodeMap.caseNodes || []).map(x => (
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
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <NodeMenu id={id} onEvent={onEvent} />
      </div>
    </div>
  );
};

SwitchCondition.propTypes = NodeProps;
SwitchCondition.defaultProps = defaultNodeProps;
