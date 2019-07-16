// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { transformIfCondtion } from '../../transformers/transformIfCondition';
import { NodeEventTypes } from '../../shared/NodeEventTypes';
// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';
import { GraphNode } from '../../shared/GraphNode';
import { OffsetContainer } from '../../shared/OffsetContainer';
import { StepGroup } from '../groups';
import { areBoundariesEqual } from '../../shared/Boundary';
import { Edge } from '../shared/EdgeComponents';
import { ifElseLayouter } from '../../layouters/ifelseLayouter';

import { Diamond } from './templates/Diamond';
import { DefaultRenderer } from './DefaultRenderer';

const calculateNodeMap = (path, data) => {
  const { condition, choice, ifGroup, elseGroup } = transformIfCondtion(data, path);
  return {
    conditionNode: GraphNode.fromIndexedJson(condition),
    choiceNode: GraphNode.fromIndexedJson(choice),
    ifGroupNode: GraphNode.fromIndexedJson(ifGroup),
    elseGroupNode: GraphNode.fromIndexedJson(elseGroup),
  };
};

const calculateLayout = (nodeMap, boundaryMap) => {
  (Object.values(nodeMap) as GraphNode[])
    .filter(x => !!x)
    .forEach((x: GraphNode) => (x.boundary = boundaryMap[x.id] || x.boundary));

  return ifElseLayouter(nodeMap.conditionNode, nodeMap.choiceNode, nodeMap.ifGroupNode, nodeMap.elseGroupNode);
};

export const IfCondition: FunctionComponent<NodeProps> = ({
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
  const condition = nodeMap ? nodeMap.condition : { id: '', data: {}, offset: '' };

  return (
    <div style={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={condition.offset}>
        <DefaultRenderer
          key={condition.id}
          id={condition.id}
          data={condition.data}
          focusedId={focusedId}
          getLgTemplates={getLgTemplates}
          onEvent={onEvent}
        />
      </OffsetContainer>
      <OffsetContainer offset={nodeMap && nodeMap.choice.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeEventTypes.Focus, id);
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
                  focusedId={focusedId}
                  getLgTemplates={getLgTemplates}
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
