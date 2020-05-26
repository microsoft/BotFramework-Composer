// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FunctionComponent, useMemo, useContext } from 'react';
import { WidgetContainerProps } from '@bfc/extension';

import { transformIfCondtion } from '../adaptive-sdk/transformers/transformIfCondition';
import { ifElseLayouter } from '../adaptive-sdk/layouters/ifelseLayouter';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { Diamond } from '../components/lib/Diamond';
import { ElementMeasurer } from '../components/lib/ElementMeasurer';
import { SVGContainer } from '../components/lib/SVGContainer';
import { useSmartLayout, GraphNodeMap } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';
import { FlowEdges } from '../components/lib/FlowEdges';
import { FlowRendererContext } from '../store/FlowRendererContext';

import { ActionGroup } from './ActionGroup';

enum IfElseNodes {
  Condition = 'conditionNode',
  Choice = 'choiceNode',
  IfBranch = 'ifBranchNode',
  ElseBranch = 'elseBranchNode',
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

const calculateIfElseLayout = (nodeMap: GraphNodeMap<IfElseNodes>) => {
  const { conditionNode, choiceNode, ifBranchNode, elseBranchNode } = nodeMap;
  return ifElseLayouter(conditionNode, choiceNode, ifBranchNode, elseBranchNode);
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
  const { NodeWrapper } = useContext(FlowRendererContext);
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout(nodeMap, calculateIfElseLayout, onResize);

  const { boundary, edges } = layout;
  const { conditionNode, choiceNode } = nodeMap;

  return (
    <div css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer width={boundary.width} height={boundary.height}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      <OffsetContainer offset={conditionNode.offset}>
        <NodeWrapper nodeId={conditionNode.id} nodeData={data} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(conditionNode.data, boundary);
              updateNodeBoundary(IfElseNodes.Condition, boundary);
            }}
          >
            {judgement}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer offset={choiceNode.offset}>
        <Diamond
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      {[IfElseNodes.IfBranch, IfElseNodes.ElseBranch].map(nodeName => {
        const node = nodeMap[nodeName];
        return (
          <OffsetContainer key={`${node.id}/offset`} offset={node.offset}>
            <ActionGroup
              key={node.id}
              id={node.id}
              data={node.data}
              onEvent={onEvent}
              onResize={size => {
                updateNodeBoundary(nodeName, size);
              }}
            />
          </OffsetContainer>
        );
      })}
    </div>
  );
};

IfConditionWidget.defaultProps = {
  onResize: () => null,
};
