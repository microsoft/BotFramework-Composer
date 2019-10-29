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
import formatMessage from 'format-message';
import { DialogGroup } from 'shared';

import { NodeColors } from '../../../constants/ElementColors';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { textInputLayouter } from '../../../layouters/textInputLayouter';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { NodeMenu } from '../../menus/NodeMenu';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { OffsetContainer } from '../../lib/OffsetContainer';
import { Diamond } from '../templates/Diamond';
import { Edge } from '../../lib/EdgeComponents';
import { useLgTemplate } from '../../../utils/hooks';

export const TextInput: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const layout = textInputLayouter(id);
  const { boundary, nodeMap, edges } = layout;
  const { initPrompt, propertyBox, unrecognizedPrompt, invalidPrompt, diamond1, diamond2 } = nodeMap;
  const templateText = useLgTemplate(data.prompt, data.$designer && data.$designer.id);

  return (
    <div className="Action-TextInput" css={{ width: boundary.width, height: boundary.height }}>
      <OffsetContainer offset={initPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Text Input')}
          corner={<NodeMenu id={id} onEvent={onEvent} />}
          icon={ElementIcon.MessageBot}
          label={templateText || '<initPrompt>'}
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={propertyBox.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.INPUT]}
          header={formatMessage('Property')}
          icon={ElementIcon.User}
          label={data.property || '<property>'}
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={unrecognizedPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Unrecognized prompt')}
          icon={ElementIcon.MessageBot}
          label={data.unrecognizedPrompt || '<unrecognizedPrompt>'}
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={invalidPrompt.offset}>
        <FormCard
          nodeColors={NodeColors[DialogGroup.RESPONSE]}
          header={formatMessage('Invalid prompt')}
          icon={ElementIcon.MessageBot}
          label={data.invalidPrompt || '<invalidPrompt>'}
          onClick={() => {
            onEvent(NodeEventTypes.Focus, { id });
          }}
        />
      </OffsetContainer>
      <OffsetContainer offset={diamond1.offset}>
        <Diamond color={'#C4C4C4'} />
      </OffsetContainer>
      <OffsetContainer offset={diamond2.offset}>
        <Diamond color={'#C4C4C4'} />
      </OffsetContainer>
      {edges ? edges.map(x => <Edge key={x.id} {...x} />) : null}
    </div>
  );
};
