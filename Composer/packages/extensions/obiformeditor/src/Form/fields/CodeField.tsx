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
import React, { useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { Dropdown, IDropdownOption, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/lib/codemirror.css';

import './codemirror-fabric.css';
import './styles.css';
import { BaseField } from './BaseField';

const cmOptions = {
  theme: 'fabric',
  viewportMargin: Infinity,
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
  smartIndent: true,
  height: 'auto',
};

const modeOptions: IDropdownOption[] = [
  {
    text: 'C#',
    key: 'text/x-csharp',
  },
  {
    text: 'Javscript',
    key: 'javascript',
  },
];

export const CodeField: React.FC<FieldProps> = props => {
  const [mode, setMode] = useState('javascript');
  const [initialData] = useState(props.formData);

  return (
    <BaseField {...props} className="CodeField">
      <MessageBar messageBarType={MessageBarType.warning}>
        <strong>{formatMessage('Experimental:')}</strong>&nbsp;
        {formatMessage('The code step is experimental. It should be used cautiously.')}
      </MessageBar>

      <div className="CodeFieldModeSelector">
        <Dropdown
          label={formatMessage('Language')}
          options={modeOptions}
          selectedKey={mode}
          onChange={(e, item) => {
            if (item) {
              setMode(item.key as string);
            }
          }}
        />
      </div>
      <CodeMirror
        value={initialData}
        options={{ ...cmOptions, mode }}
        onChange={(editor, data, value) => {
          props.onChange(value);
        }}
        autoCursor={false}
      />
    </BaseField>
  );
};
