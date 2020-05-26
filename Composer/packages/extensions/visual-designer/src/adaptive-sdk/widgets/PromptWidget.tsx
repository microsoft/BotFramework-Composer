// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useMemo, useContext } from 'react';
import { PromptTab } from '@bfc/shared';
import { WidgetContainerProps } from '@bfc/extension';

import { baseInputLayouter } from '../layouters/baseInputLayouter';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../lib/OffsetContainer';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { IconBrick } from '../../components/decorations/IconBrick';
import { SVGContainer } from '../lib/SVGContainer';
import { GraphLayout } from '../models/GraphLayout';
import { ElementMeasurer } from '../lib/ElementMeasurer';
import { useSmartLayout, GraphNodeMap } from '../hooks/useSmartLayout';
import { designerCache } from '../../store/DesignerCache';
import { FlowEdges } from '../lib/FlowEdges';
import { FlowRendererContext } from '../../store/FlowRendererContext';

enum PromptNodes {
  BotAsks = 'botAsksNode',
  UserAnswers = 'userAnswersNode',
  InvalidPrompt = 'invalidPromptyNode',
}

const calculateNodes = (jsonpath: string, data) => {
  const { botAsks, userAnswers, invalidPrompt } = transformBaseInput(data, jsonpath);
  return {
    [PromptNodes.BotAsks]: GraphNode.fromIndexedJson(botAsks),
    [PromptNodes.UserAnswers]: GraphNode.fromIndexedJson(userAnswers),
    [PromptNodes.InvalidPrompt]: GraphNode.fromIndexedJson(invalidPrompt),
  };
};

const calculateLayout = (nodeMap: GraphNodeMap<PromptNodes>): GraphLayout => {
  const { botAsksNode, userAnswersNode, invalidPromptyNode } = nodeMap;
  return baseInputLayouter(botAsksNode, userAnswersNode, invalidPromptyNode);
};

export interface PromptWdigetProps extends WidgetContainerProps {
  botAsks: JSX.Element;
  userInput: JSX.Element;
}

export const PromptWidget: FC<PromptWdigetProps> = ({
  id,
  data,
  onEvent,
  onResize,
  botAsks,
  userInput,
}): JSX.Element => {
  const { NodeWrapper } = useContext(FlowRendererContext);
  const nodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<PromptNodes>(nodes, calculateLayout, onResize);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer width={boundary.width} height={boundary.height}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      <OffsetContainer offset={botAsksNode.offset}>
        <NodeWrapper nodeId={botAsksNode.id} nodeTab={PromptTab.BOT_ASKS} nodeData={data} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(botAsksNode.data, boundary);
              updateNodeBoundary(PromptNodes.BotAsks, boundary);
            }}
          >
            {botAsks}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <NodeWrapper nodeId={userAnswersNode.id} nodeTab={PromptTab.USER_INPUT} nodeData={data} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(userAnswersNode.data, boundary);
              updateNodeBoundary(PromptNodes.UserAnswers, boundary);
            }}
          >
            {userInput}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <NodeWrapper nodeId={brickNode.id} nodeTab={PromptTab.OTHER} nodeData={data} onEvent={onEvent}>
          <IconBrick onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.OTHER })} />
        </NodeWrapper>
      </OffsetContainer>
    </div>
  );
};
