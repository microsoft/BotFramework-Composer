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
import { Icon } from 'office-ui-fabric-react';

import { IconBrickSize } from '../../constants/ElementSizes';

export const IconBrick = ({ onClick }): JSX.Element => {
  return (
    <div
      css={{
        ...IconBrickSize,
        background: '#FFFFFF',
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FED9CC',
          width: 16,
          height: 16,
          borderRadius: '8px',
        }}
      >
        <Icon iconName="ErrorBadge" style={{ fontSize: 8 }} />
      </div>
    </div>
  );
};
