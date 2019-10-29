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
import React from 'react';
import { TextField } from 'office-ui-fabric-react';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';

export const TextareaWidget: React.FunctionComponent<BFDWidgetProps> = props => {
  const { onBlur, onChange, onFocus, readonly, value, placeholder, schema, id, disabled, label } = props;
  const { description, examples = [] } = schema;

  let placeholderText = placeholder;

  if (!placeholderText && examples.length > 0) {
    placeholderText = `ex. ${examples.join(', ')}`;
  }

  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <TextField
        disabled={disabled}
        id={id}
        multiline
        onBlur={() => onBlur && onBlur(id, value)}
        onChange={(_, newValue?: string) => onChange(newValue)}
        onFocus={() => onFocus && onFocus(id, value)}
        placeholder={placeholderText}
        readOnly={readonly}
        value={value}
        styles={{
          subComponentStyles: {
            label: { root: { fontSize: '12px', fontWeight: '400' } },
          },
        }}
      />
    </>
  );
};

TextareaWidget.defaultProps = {
  schema: {},
  options: {},
  onBlur: () => {},
  onFocus: () => {},
};
