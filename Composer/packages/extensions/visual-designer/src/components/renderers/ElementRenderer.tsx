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
import { AttrNames } from '../../constants/ElementAttributes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import {
  DefaultRenderer,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  ActivityRenderer,
  ChoiceInput,
  BotAsks,
  UserAnswers,
  InvalidPromptBrick,
} from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.ChoiceInputDetail]: ChoiceInput,
  [ObiTypes.BotAsks]: BotAsks,
  [ObiTypes.UserAnswers]: UserAnswers,
  [ObiTypes.InvalidPromptBrick]: InvalidPromptBrick,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderHoveredStyle = css`
  box-shadow: 0px 0px 0px 1px #323130;
`;

const nodeBorderSelectedStyle = css`
  box-shadow: 0px 0px 0px 2px #0078d4;
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
const nodeBorderDoubleSelectedStyle = css`
  outline: 2px solid #0078d4;
  box-shadow: 0px 0px 0px 6px rgba(0, 120, 212, 0.3);
`;

export const ElementRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize, tab }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);
  const selectableId = tab ? `${id}${tab}` : id;
  const { focusedId, focusedEvent, focusedTab } = useContext(NodeRendererContext);
  const { selectedIds, getNodeIndex } = useContext(SelectionContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeDoubleSelected = tab && nodeFocused && tab === focusedTab;
  const nodeSelected = selectedIds.includes(id);

  const declareElementAttributes = (selectedId: string, id: string) => {
    return {
      [AttrNames.NodeElement]: true,
      [AttrNames.FocusableElement]: true,
      [AttrNames.FocusedId]: id,
      [AttrNames.SelectableElement]: true,
      [AttrNames.SelectedId]: selectedId,
      [AttrNames.SelectionIndex]: getNodeIndex(id),
      [AttrNames.Tab]: tab,
    };
  };

  return (
    <div
      className={classnames('step-renderer-container', { 'step-renderer-container--focused': nodeFocused })}
      css={css`
        position: relative;
        border-radius: 2px 2px 0 0;
        ${nodeSelected && nodeBorderSelectedStyle};
        ${nodeFocused && nodeBorderSelectedStyle};
        ${nodeDoubleSelected && nodeBorderDoubleSelectedStyle};
        &:hover {
          ${!nodeFocused && nodeBorderHoveredStyle}
        }
      `}
      {...declareElementAttributes(selectableId, id)}
    >
      <ChosenRenderer
        id={id}
        data={data}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'element');
        }}
      />
    </div>
  );
};

ElementRenderer.defaultProps = defaultNodeProps;
