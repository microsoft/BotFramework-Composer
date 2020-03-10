// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useMemo } from 'react';
import { PromptTab } from '@bfc/shared';

import { baseInputLayouter } from '../layouters/baseInputLayouter';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { WidgetContainerProps } from '../schema/uischema.types';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { IconBrick } from '../components/decorations/IconBrick';
import { renderEdge } from '../components/lib/EdgeUtil';
import { SVGContainer } from '../components/lib/SVGContainer';
import { GraphLayout } from '../models/GraphLayout';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { useSmartLayout, GraphNodeMap } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';

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
  const nodes = useMemo(() => calculateNodes(id, data), [id, data]);
  const { layout, updateNodeBoundary } = useSmartLayout<PromptNodes>(nodes, calculateLayout, onResize);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={botAsksNode.offset}>
        <ElementWrapper id={botAsksNode.id} tab={PromptTab.BOT_ASKS} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(botAsksNode.data, boundary);
              updateNodeBoundary(PromptNodes.BotAsks, boundary);
            }}
          >
            {botAsks}
          </ElementMeasurer>
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <ElementWrapper id={userAnswersNode.id} tab={PromptTab.USER_INPUT} onEvent={onEvent}>
          <ElementMeasurer
            onResize={boundary => {
              designerCache.cacheBoundary(userAnswersNode.data, boundary);
              updateNodeBoundary(PromptNodes.UserAnswers, boundary);
            }}
          >
            {userInput}
          </ElementMeasurer>
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <ElementWrapper id={brickNode.id} tab={PromptTab.OTHER} onEvent={onEvent}>
          <IconBrick onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.OTHER })} />
        </ElementWrapper>
      </OffsetContainer>
      <SVGContainer>{Array.isArray(edges) ? edges.map(x => renderEdge(x)) : null}</SVGContainer>
    </div>
  );
};
