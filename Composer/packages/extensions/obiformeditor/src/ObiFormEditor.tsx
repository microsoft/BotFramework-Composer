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
import ErrorBoundary, { FallbackProps } from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';

import { FormEditor, FormEditorProps } from './FormEditor';

const emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});

const ErrorInfo: React.FC<FallbackProps> = ({ componentStack, error }) => (
  <div style={{ marginRight: '20px' }}>
    <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Oops! An error occured in the form editor!</strong>
        <br />
        This is likely due to malformed data or missing functionality in Composer.
        <br />
        Try navigating to another node in the visual editor.
      </p>
      <p>Here’s what we know…</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Error:</strong> {error && error.toString()}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Component Stacktrace:</strong> {componentStack}
      </p>
    </MessageBar>
  </div>
);

const ObiFormEditor: React.FC<FormEditorProps> = props => {
  const onChange = data => {
    props.onChange(data, props.focusedSteps[0]);
  };

  const key = get(props.data, '$designer.id', props.focusPath);

  return (
    <CacheProvider value={emotionCache}>
      <ErrorBoundary key={`${props.botName}-${key}`} FallbackComponent={ErrorInfo}>
        <FormEditor {...props} onChange={onChange} />
      </ErrorBoundary>
    </CacheProvider>
  );
};

export default ObiFormEditor;
