// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent, useMemo } from 'react';

import { transformIfCondtion } from '../transformers/transformIfCondition';
import { ifElseLayouter } from '../layouters/ifelseLayouter';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { StepGroup } from '../components/groups';
import { Diamond } from '../components/nodes/templates/Diamond';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { WidgetContainerProps } from '../schema/uischema.types';
import { SVGContainer } from '../components/lib/SVGContainer';
import { renderEdge } from '../components/lib/EdgeUtil';
import { useSmartLayout, GraphNodeMap, BoundaryMap } from '../hooks/useSmartLayout';

enum IfElseNodes {
  Condition = 'ConditionNode',
  Choice = 'ChoiceNode',
  IfBranch = 'IfBranchNode',
  ElseBranch = 'ElseBranchNode',
}

const calculateNodeMap = (path: string, data): GraphNodeMap<IfElseNodes> => {
  const result = transformIfCondtion(data, path);
  if (!result)
    return {
      [IfElseNodes.Condition]: new GraphNode(),
      [IfElseNodes.Choice]: new GraphNode(),
      [IfElseNodes.IfBranch]: new GraphNode(),
      [IfElseNodes.ElseBranch]: new GraphNode(),
    };

  const { condition, choice, ifGroup, elseGroup } = result;
  return {
    [IfElseNodes.Condition]: GraphNode.fromIndexedJson(condition),
    [IfElseNodes.Choice]: GraphNode.fromIndexedJson(choice),
    [IfElseNodes.IfBranch]: GraphNode.fromIndexedJson(ifGroup),
    [IfElseNodes.ElseBranch]: GraphNode.fromIndexedJson(elseGroup),
  };
};

const calculateIfElseLayout = (nodeMap: GraphNodeMap<IfElseNodes>, boundaryMap: BoundaryMap<IfElseNodes>) => {
  Object.values(nodeMap)
    .filter(x => !!x)
    .forEach((x: GraphNode) => (x.boundary = boundaryMap[x.id] || x.boundary));

  return ifElseLayouter(nodeMap.ConditionNode, nodeMap.ChoiceNode, nodeMap.IfBranchNode, nodeMap.ElseBranchNode);
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
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout(nodeMap, calculateIfElseLayout, onResize);

  const { boundary, edges } = layout;
  const { ConditionNode, ChoiceNode, IfBranchNode, ElseBranchNode } = nodeMap;

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={ConditionNode.offset}>
        <ElementWrapper id={ConditionNode.id} onEvent={onEvent}>
          <ElementMeasurer onResize={boundary => updateNodeBoundary(IfElseNodes.Condition, boundary)}>
            {judgement}
          </ElementMeasurer>
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={ChoiceNode.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      {[IfBranchNode, ElseBranchNode].map(x => (
        <OffsetContainer key={`${x.id}/offset`} offset={x.offset}>
          <StepGroup
            key={x.id}
            id={x.id}
            data={x.data}
            onEvent={onEvent}
            onResize={size => {
              updateNodeBoundary(IfElseNodes.IfBranch, size);
            }}
          />
        </OffsetContainer>
      ))}
      <SVGContainer>{Array.isArray(edges) ? edges.map(x => renderEdge(x)) : null}</SVGContainer>
    </div>
  );
};

IfConditionWidget.defaultProps = {
  onResize: () => null,
};
