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
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { RichEditor } from 'code-editor';
import { EditorWillMount } from '@bfcomposer/react-monaco-editor';

import './styles.css';

import { BaseField } from './BaseField';

export const JsonField: React.FC<FieldProps> = props => {
  const [value, setValue] = useState<string>(JSON.stringify(props.formData, null, 2));
  const [parseError, setParseError] = useState<string>('');

  const handleChange = value => {
    setValue(value);
    try {
      const data = JSON.parse(value);
      props.onChange(data);
      setParseError('');
    } catch (err) {
      setParseError('invalid json');
    }
  };

  const handleMount: EditorWillMount = monaco => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
    });
  };

  return (
    <BaseField {...props} className="JsonField">
      <div style={{ height: '315px' }}>
        <RichEditor
          language="json"
          onChange={handleChange}
          errorMsg={parseError}
          editorWillMount={handleMount}
          options={{ folding: false }}
          value={value}
          helpURL="https://www.json.org"
        />
      </div>
    </BaseField>
  );
};
