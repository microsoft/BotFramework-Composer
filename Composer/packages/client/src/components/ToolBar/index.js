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
import React, { Fragment } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { headerSub, leftActions, rightActions, actionButton } from './styles';

function itemList(action, index) {
  if (action.type === 'element') {
    return <Fragment key={index}>{action.element}</Fragment>;
  } else {
    return (
      <ActionButton key={index} css={actionButton} {...action.buttonProps} data-testid={action.dataTestid}>
        {action.text}
      </ActionButton>
    );
  }
}
// support ActionButton or React Elements, the display order is array index.
// action = {type:action/element, text, align, element, buttonProps: use
// fabric-ui IButtonProps interface}
export function ToolBar(props) {
  const { toolbarItems, ...rest } = props;
  let left = [];
  let right = [];
  if (toolbarItems && toolbarItems.length > 0) {
    left = toolbarItems.filter(item => {
      return item.align === 'left';
    });
    right = toolbarItems.filter(item => {
      return item.align === 'right';
    });
  }
  return (
    <div css={headerSub} {...rest}>
      <div css={leftActions}>{left.map(itemList)}</div>
      <div css={rightActions}>{right.map(itemList)}</div>
    </div>
  );
}
