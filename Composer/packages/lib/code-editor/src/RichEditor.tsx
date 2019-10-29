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
import React, { Fragment, useMemo, useState } from 'react';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { BaseEditor, BaseEditorProps } from './BaseEditor';

export interface RichEditorProps extends BaseEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  helpURL?: string; //  help link show below editor
  height?: number | string;
}

export function RichEditor(props: RichEditorProps) {
  const { errorMsg, helpURL, placeholder, hidePlaceholder = false, height, ...rest } = props;
  const isInvalid = !!errorMsg;
  const [hovered, setHovered] = useState(false);

  const errorHelp = formatMessage.rich(
    'This text has errors in the syntax. Refer to the syntax documentation <a>here</a>.',
    {
      // eslint-disable-next-line react/display-name
      a: ({ children }) => (
        <a key="a" href={helpURL} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }
  );

  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }

    if (typeof height === 'string') {
      return height;
    }

    return `${height}px`;
  };

  let borderColor = NeutralColors.gray120;

  if (hovered) {
    borderColor = NeutralColors.gray160;
  }

  if (isInvalid) {
    borderColor = SharedColors.red20;
  }

  return (
    <Fragment>
      <div
        style={{
          height: `calc(${getHeight()} - 40px)`,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor,
          transition: 'border-color 0.1s linear',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BaseEditor {...rest} placeholder={hidePlaceholder ? undefined : placeholder} />
      </div>
      {isInvalid && (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorHelp}</span>
        </div>
      )}
    </Fragment>
  );
}
