/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from 'shared';

import { baseInputLayouter } from '../../../layouters/baseInputLayouter';
import { NodeProps } from '../nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { GraphNode } from '../../../models/GraphNode';
import { transformBaseInput } from '../../../transformers/transformBaseInput';
import { ElementRenderer } from '../../renderers/ElementRenderer';

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
        <ElementRenderer
          id={botAsksNode.id}
          tab={PromptTab.BOT_ASKS}
          data={botAsksNode.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <ElementRenderer
          id={userAnswersNode.id}
          tab={PromptTab.USER_ANSWERS}
          data={userAnswersNode.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <ElementRenderer
          id={brickNode.id}
          tab={PromptTab.EXCEPTIONS}
          data={brickNode.data}
          onEvent={onEvent}
          onResize={onResize}
        />
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
