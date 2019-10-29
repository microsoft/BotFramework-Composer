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
import { FC, ComponentClass } from 'react';

import { ObiTypes } from '../../constants/ObiTypes';
import { IfCondition, SwitchCondition, Foreach, BaseInput } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

import { ElementRenderer } from './ElementRenderer';

const rendererByObiType = {
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
  [ObiTypes.AttachmentInput]: BaseInput,
  [ObiTypes.ConfirmInput]: BaseInput,
  [ObiTypes.DateTimeInput]: BaseInput,
  [ObiTypes.NumberInput]: BaseInput,
  [ObiTypes.OAuthInput]: BaseInput,
  [ObiTypes.TextInput]: BaseInput,
  [ObiTypes.ChoiceInput]: BaseInput,
};
const DEFAULT_RENDERER = ElementRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  return (
    <ChosenRenderer
      id={id}
      data={data}
      onEvent={onEvent}
      onResize={size => {
        onResize(size, 'node');
      }}
    />
  );
};

StepRenderer.defaultProps = defaultNodeProps;
