// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Suspense } from 'react';
import ErrorBoundary, { FallbackProps } from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import get from 'lodash/get';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';

import { FormEditor, FormEditorProps } from './FormEditor';
import { LoadingSpinner } from './LoadingSpinner';

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
    <Suspense fallback={<LoadingSpinner />}>
      <CacheProvider value={emotionCache}>
        <ErrorBoundary key={`${props.botName}-${key}`} FallbackComponent={ErrorInfo}>
          <FormEditor {...props} onChange={onChange} />
        </ErrorBoundary>
      </CacheProvider>
    </Suspense>
  );
};

export default ObiFormEditor;
