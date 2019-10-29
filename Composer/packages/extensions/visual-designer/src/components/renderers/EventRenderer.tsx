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
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../constants/ObiTypes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { IntentRule, ConversationUpdateActivityRule, EventRule, UnknownIntentRule } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.OnCondition]: EventRule,
  [ObiTypes.OnIntent]: IntentRule,
  [ObiTypes.OnUnknownIntent]: UnknownIntentRule,
  [ObiTypes.OnConversationUpdateActivity]: ConversationUpdateActivityRule,
};
const DEFAULT_RENDERER = UnknownIntentRule;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderStyle = css`
  outline: 2px solid grey;
`;

export const EventRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const nodeFocused = focusedId === id || focusedEvent === id;

  return (
    <div
      className={classnames('event-renderer-container', { 'event-renderer-container--focused': nodeFocused })}
      css={css`
        display: inline-block;
        position: relative;
        ${nodeFocused && nodeBorderStyle}
      `}
    >
      <ChosenRenderer
        id={id}
        data={data}
        focused={nodeFocused}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'node');
        }}
      />
    </div>
  );
};

EventRenderer.defaultProps = defaultNodeProps;
