/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
