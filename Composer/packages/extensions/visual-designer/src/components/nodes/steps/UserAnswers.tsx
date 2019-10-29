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
import { DialogGroup, PromptTab } from 'shared';

import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { ObiTypes } from '../../../constants/ObiTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { getUserAnswersTitle } from '../utils';

import { ChoiceInput } from './ChoiceInput';

export const UserAnswers: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  if (data.$type === ObiTypes.ChoiceInputDetail) {
    return <ChoiceInput id={id} data={data} onEvent={onEvent} onResize={onResize} />;
  }

  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      icon={ElementIcon.User}
      header={getUserAnswersTitle(data._type)}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.USER_ANSWERS });
      }}
    />
  );
};
