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
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { List } from 'office-ui-fabric-react/lib/List';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Fragment } from 'react';

import { exampleListContainer, exampleListClass } from './styles';

interface ExampleListProps {
  examples: any;
  onClick: (templateId: string) => void;
}

export const ExampleList: React.FC<ExampleListProps> = props => {
  const { onClick, examples } = props;

  function _onRenderCell(item?: any, index?: number): React.ReactNode {
    return (
      <div
        className={exampleListClass.itemCell}
        data-is-focusable={true}
        key={item.id}
        onClick={() => onClick(item.id)}
      >
        <FontIcon iconName="Robot" className={exampleListClass.image} />
        <div className={exampleListClass.itemContent}>
          <div className={exampleListClass.itemName}>{item.name}</div>
          <div className={exampleListClass.itemIndex}>{item.description}</div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div data-is-scrollable="true" css={exampleListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <List items={examples} onRenderCell={_onRenderCell} />
        </ScrollablePane>
      </div>
    </Fragment>
  );
};
