// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent, useEffect, useState, useMemo } from 'react';

import { transformIfCondtion } from '../transformers/transformIfCondition';
import { ifElseLayouter } from '../layouters/ifelseLayouter';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { areBoundariesEqual, Boundary } from '../models/Boundary';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { StepGroup } from '../components/groups';
import { Diamond } from '../components/nodes/templates/Diamond';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { NodeMap, BoundaryMap } from '../components/nodes/types';
import { WidgetContainerProps } from '../schema/uischema.types';
import { SVGContainer } from '../components/lib/SVGContainer';
import { renderEdge } from '../components/lib/EdgeUtil';

const calculateNodeMap = (path, data): NodeMap => {
  const result = transformIfCondtion(data, path);
  if (!result) return {};

  const { condition, choice, ifGroup, elseGroup } = result;
  return {
    conditionNode: GraphNode.fromIndexedJson(condition),
    choiceNode: GraphNode.fromIndexedJson(choice),
    ifGroupNode: GraphNode.fromIndexedJson(ifGroup),
    elseGroupNode: GraphNode.fromIndexedJson(elseGroup),
  };
};

const calculateLayout = (nodeMap: NodeMap, boundaryMap: BoundaryMap) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach((x: GraphNode) => (x.boundary = boundaryMap[x.id] || x.boundary));

  return ifElseLayouter(nodeMap.conditionNode, nodeMap.choiceNode, nodeMap.ifGroupNode, nodeMap.elseGroupNode);
};

export interface IfConditionWidgetProps extends WidgetContainerProps {
  judgement: JSX.Element;
}

export const IfConditionWidget: FunctionComponent<IfConditionWidgetProps> = ({
  id,
  data,
  onEvent,
  onResize,
  judgement,
}) => {
  const [boundaryMap, setBoundaryMap] = useState<BoundaryMap>({});
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
  const condition = nodeMap.condition || new GraphNode();
  const choice = nodeMap.choice || new GraphNode();

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={condition.offset}>
        <ElementWrapper id={condition.id} onEvent={onEvent}>
          <ElementMeasurer onResize={boundary => patchBoundary(condition.id, boundary)}>{judgement}</ElementMeasurer>
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={choice.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
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
                  onEvent={onEvent}
                  onResize={size => {
                    patchBoundary(x.id, size);
                  }}
                />
              </OffsetContainer>
            ))
        : null}
      <SVGContainer>{Array.isArray(edges) ? edges.map(x => renderEdge(x)) : null}</SVGContainer>
    </div>
  );
};

IfConditionWidget.defaultProps = {
  onResize: () => null,
};
