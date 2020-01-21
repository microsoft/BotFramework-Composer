// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from '@bfc/shared';

import { baseInputLayouter } from '../layouters/baseInputLayouter';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { Edge } from '../components/lib/EdgeComponents';
import { WidgetContainerProps } from '../schema/uischema.types';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { IconBrick } from '../components/decorations/IconBrick';

const calculateNodes = (data, jsonpath: string) => {
  const { botAsks, userAnswers, invalidPrompt } = transformBaseInput(data, jsonpath);
  return {
    botAsksNode: GraphNode.fromIndexedJson(botAsks),
    userAnswersNode: GraphNode.fromIndexedJson(userAnswers),
    invalidPromptNode: GraphNode.fromIndexedJson(invalidPrompt),
  };
};

export interface PromptWdigetProps extends WidgetContainerProps {
  botAsks: JSX.Element;
  userInput: JSX.Element;
}

export const PromptWidget: FC<PromptWdigetProps> = ({ id, data, onEvent, botAsks, userInput }): JSX.Element => {
  const nodes = calculateNodes(data, id);
  const layout = baseInputLayouter(nodes.botAsksNode, nodes.userAnswersNode, nodes.invalidPromptNode);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={botAsksNode.offset}>
        <ElementWrapper id={botAsksNode.id} tab={PromptTab.BOT_ASKS} onEvent={onEvent}>
          {botAsks}
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <ElementWrapper id={userAnswersNode.id} tab={PromptTab.USER_INPUT} onEvent={onEvent}>
          {userInput}
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <ElementWrapper id={brickNode.id} tab={PromptTab.OTHER} onEvent={onEvent}>
          <IconBrick onClick={() => onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.OTHER })} />
        </ElementWrapper>
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
