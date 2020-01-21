// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from '@bfc/shared';

import { baseInputLayouter } from '../../../layouters/baseInputLayouter';
import { NodeProps } from '../nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { GraphNode } from '../../../models/GraphNode';
import { transformBaseInput } from '../../../transformers/transformBaseInput';
import { ElementWrapper } from '../../renderers/ElementWrapper';
import { BotAsks } from '../steps/BotAsks';
import { UserInput } from '../steps/UserInput';
import { InvalidPromptBrick } from '../steps/InvalidPromptBrick';

const calculateNodes = (data, jsonpath: string) => {
  const { botAsks, userAnswers, invalidPrompt } = transformBaseInput(data, jsonpath);
  return {
    botAsksNode: GraphNode.fromIndexedJson(botAsks),
    userAnswersNode: GraphNode.fromIndexedJson(userAnswers),
    invalidPromptNode: GraphNode.fromIndexedJson(invalidPrompt),
  };
};

export const BaseInput: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const nodes = calculateNodes(data, id);
  const layout = baseInputLayouter(nodes.botAsksNode, nodes.userAnswersNode, nodes.invalidPromptNode);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height }}>
      <OffsetContainer offset={botAsksNode.offset}>
        <ElementWrapper id={botAsksNode.id} tab={PromptTab.BOT_ASKS}>
          <BotAsks id={botAsksNode.id} data={botAsksNode.data} onEvent={onEvent} onResize={onResize} />
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <ElementWrapper id={userAnswersNode.id} tab={PromptTab.USER_INPUT}>
          <UserInput id={userAnswersNode.id} data={userAnswersNode.data} onEvent={onEvent} onResize={onResize} />
        </ElementWrapper>
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <ElementWrapper id={brickNode.id} tab={PromptTab.OTHER}>
          <InvalidPromptBrick id={brickNode.id} data={brickNode.data} onEvent={onEvent} onResize={onResize} />
        </ElementWrapper>
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
