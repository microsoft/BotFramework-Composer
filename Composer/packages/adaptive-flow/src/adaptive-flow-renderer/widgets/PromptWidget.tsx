// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useMemo, useContext } from 'react';
import { PromptTab } from '@bfc/shared';
import { WidgetContainerProps } from '@bfc/extension-client';

import { baseInputLayouter } from '../layouters/baseInputLayouter';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/OffsetContainer';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { IconBrick } from '../components/IconBrick';
import { SVGContainer } from '../components/SVGContainer';
import { GraphLayout } from '../models/GraphLayout';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { useSmartLayout, GraphNodeMap } from '../hooks/useSmartLayout';
import { designerCache } from '../utils/visual/DesignerCache';
import { FlowEdges } from '../components/FlowEdges';
import { RendererContext } from '../contexts/RendererContext';

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
  const { NodeWrapper } = useContext(RendererContext);
  const nodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<PromptNodes>(nodes, calculateLayout, onResize);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <SVGContainer height={boundary.height} width={boundary.width}>
        <FlowEdges edges={edges} />
      </SVGContainer>
      <OffsetContainer offset={botAsksNode.offset}>
        <NodeWrapper nodeData={data} nodeId={botAsksNode.id} nodeTab={PromptTab.BOT_ASKS} onEvent={onEvent}>
          <ElementMeasurer
            onResize={(boundary) => {
              designerCache.cacheBoundary(botAsksNode.data, boundary);
              updateNodeBoundary(PromptNodes.BotAsks, boundary);
            }}
          >
            {botAsks}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <NodeWrapper nodeData={data} nodeId={userAnswersNode.id} nodeTab={PromptTab.USER_INPUT} onEvent={onEvent}>
          <ElementMeasurer
            onResize={(boundary) => {
              designerCache.cacheBoundary(userAnswersNode.data, boundary);
              updateNodeBoundary(PromptNodes.UserAnswers, boundary);
            }}
          >
            {userInput}
          </ElementMeasurer>
        </NodeWrapper>
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <NodeWrapper nodeData={data} nodeId={brickNode.id} nodeTab={PromptTab.OTHER} onEvent={onEvent}>
          <IconBrick
            disabled={data.disabled === true}
            onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.OTHER })}
          />
        </NodeWrapper>
      </OffsetContainer>
    </div>
  );
};
