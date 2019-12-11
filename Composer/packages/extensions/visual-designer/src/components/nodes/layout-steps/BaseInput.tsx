// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { PromptTab } from '@bfc/shared';

import { baseInputLayouter } from '../../../layouters/baseInputLayouter';
import { NodeProps } from '../types/nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Edge } from '../../lib/EdgeComponents';
import { GraphNode } from '../../../models/GraphNode';
import { transformBaseInput } from '../../../transformers/transformBaseInput';
import { ElementRenderer } from '../renderers/ElementRenderer';
import { NodeEventTypes } from '../types/NodeEventTypes';
import { NodeEventhandler } from '../types/NodeEventHandler';

const calculateNodes = (data, jsonpath: string) => {
  const { botAsks, userAnswers, invalidPrompt } = transformBaseInput(data, jsonpath);
  return {
    botAsksNode: GraphNode.fromIndexedJson(botAsks),
    userAnswersNode: GraphNode.fromIndexedJson(userAnswers),
    invalidPromptNode: GraphNode.fromIndexedJson(invalidPrompt),
  };
};

export const BaseInput: FC<NodeProps> = ({ id, data, onEvent, onResize, renderers }): JSX.Element => {
  const nodes = calculateNodes(data, id);
  const layout = baseInputLayouter(nodes.botAsksNode, nodes.userAnswersNode, nodes.invalidPromptNode);

  const { boundary, nodeMap, edges } = layout;
  const { botAsksNode, userAnswersNode, invalidPromptNode: brickNode } = nodeMap;

  const overrideClickEvent = (tab: PromptTab, onEvent): NodeEventhandler => (
    nodeId: string,
    eventName: NodeEventTypes,
    eventData?: any
  ) => {
    if (eventName === NodeEventTypes.ClickNode) {
      onEvent(nodeId, NodeEventTypes.ClickNode, { part: tab });
    } else {
      onEvent(nodeId, eventName, eventData);
    }
  };

  return (
    <div className="Action-BaseInput" css={{ width: boundary.width, height: boundary.height, position: 'relative' }}>
      <OffsetContainer offset={botAsksNode.offset}>
        <ElementRenderer
          id={botAsksNode.id}
          tab={PromptTab.BOT_ASKS}
          data={botAsksNode.data}
          onEvent={overrideClickEvent(PromptTab.BOT_ASKS, onEvent)}
          onResize={onResize}
          renderers={renderers}
        />
      </OffsetContainer>
      <OffsetContainer offset={userAnswersNode.offset}>
        <ElementRenderer
          id={userAnswersNode.id}
          tab={PromptTab.USER_INPUT}
          data={userAnswersNode.data}
          onEvent={overrideClickEvent(PromptTab.USER_INPUT, onEvent)}
          onResize={onResize}
          renderers={renderers}
        />
      </OffsetContainer>
      <OffsetContainer offset={brickNode.offset}>
        <ElementRenderer
          id={brickNode.id}
          tab={PromptTab.OTHER}
          data={brickNode.data}
          onEvent={overrideClickEvent(PromptTab.OTHER, onEvent)}
          onResize={onResize}
          renderers={renderers}
        />
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
