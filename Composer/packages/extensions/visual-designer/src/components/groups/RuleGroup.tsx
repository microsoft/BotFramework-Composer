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
import React from 'react';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { EventRenderer } from '../renderers/EventRenderer';
import { Boundary } from '../../models/Boundary';
import { EventNodeSize, EventNodeLayout } from '../../constants/ElementSizes';

const RuleElementHeight = EventNodeSize.height;
const RuleElementWidth = EventNodeSize.width;
const RulePaddingX = EventNodeLayout.marginX;
const RulePaddingY = EventNodeLayout.marginY;
const RuleBlockWidth = RuleElementWidth + RulePaddingX;
const RuleBlockHeight = RuleElementHeight + RulePaddingY;

export class RuleGroup extends React.Component<NodeProps> {
  static defaultProps = defaultNodeProps;
  containerElement;

  propagateBoundary(): void {
    if (!this.containerElement) return;

    const { scrollWidth, scrollHeight } = this.containerElement;
    this.props.onResize(new Boundary(scrollWidth, scrollHeight));
  }

  renderRule(rule, index: number): JSX.Element {
    const { id, onEvent } = this.props;
    const elementId = `${id}[${index}]`;
    return (
      <div
        key={elementId + 'block'}
        css={{
          width: RuleBlockWidth,
          height: RuleBlockHeight,
          boxSizing: 'border-box',
        }}
      >
        <EventRenderer
          id={elementId}
          data={rule}
          onEvent={onEvent}
          onResize={() => {
            this.propagateBoundary();
          }}
        />
      </div>
    );
  }

  render(): JSX.Element {
    const { data } = this.props;
    const rules = data.children || [];

    return (
      <div
        css={{
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
        }}
        ref={el => {
          this.containerElement = el;
          this.propagateBoundary();
        }}
      >
        {rules.map((x, i) => this.renderRule(x, i))}
      </div>
    );
  }
}
