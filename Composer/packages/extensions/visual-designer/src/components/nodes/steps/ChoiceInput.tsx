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

import { ChoiceInputSize, ChoiceInputMarginTop } from '../../../constants/ElementSizes';
import { NodeEventTypes } from '../../../constants/NodeEventTypes';
import { NodeColors } from '../../../constants/ElementColors';
import { measureJsonBoundary } from '../../../layouters/measureJsonBoundary';
import { ElementIcon } from '../../../utils/obiPropertyResolver';
import { FormCard } from '../templates/FormCard';
import { NodeProps } from '../nodeProps';
import { getUserAnswersTitle } from '../utils';

export const ChoiceInput: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const boundary = measureJsonBoundary(data);
  const choices = data.choices;
  let children: any = null;

  if (choices) {
    children = (
      <div data-testid="ChoiceInput" css={{ padding: '0 0 8px 45px' }}>
        {choices.map((choice, index) => {
          if (index < 3) {
            return (
              <div
                key={index}
                role="choice"
                css={{
                  height: ChoiceInputSize.height,
                  width: ChoiceInputSize.width,
                  marginTop: ChoiceInputMarginTop,
                  paddingLeft: '7px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  fontFamily: 'Segoe UI',
                  fontSize: '12px',
                  lineHeight: '19px',
                  border: '1px solid #B3B0AD',
                  boxSizing: 'border-box',
                  borderRadius: '2px',
                }}
                title={typeof choice.value === 'string' ? choice.value : ''}
              >
                {choice.value}
              </div>
            );
          }
        })}
        {choices.length > 3 ? (
          <div
            data-testid="hasMore"
            css={{
              height: ChoiceInputSize.height,
              width: ChoiceInputSize.width,
              marginTop: ChoiceInputMarginTop,
              textAlign: 'center',
              fontFamily: 'Segoe UI',
              fontSize: '12px',
              lineHeight: '19px',
              boxSizing: 'border-box',
            }}
          >
            {`${choices.length - 3} more`}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <FormCard
      nodeColors={NodeColors[DialogGroup.INPUT]}
      header={getUserAnswersTitle(data._type)}
      icon={ElementIcon.User}
      label={data.property || '<property>'}
      onClick={() => {
        onEvent(NodeEventTypes.Focus, { id, tab: PromptTab.USER_ANSWERS });
      }}
      styles={{ width: boundary.width, height: boundary.height }}
    >
      {children}
    </FormCard>
  );
};
