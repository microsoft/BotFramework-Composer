// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React, { Suspense } from 'react';
import ErrorBoundary from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import get from 'lodash/get';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { FormEditor } from './FormEditor';
import { LoadingSpinner } from './LoadingSpinner';
var emotionCache = createCache({
  // @ts-ignore
  nonce: window.__nonce__,
});
var ErrorInfo = function(_a) {
  var componentStack = _a.componentStack,
    error = _a.error;
  return React.createElement(
    'div',
    { style: { marginRight: '20px' } },
    React.createElement(
      MessageBar,
      { messageBarType: MessageBarType.error, isMultiline: false },
      React.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        React.createElement('strong', null, 'Oops! An error occured in the form editor!'),
        React.createElement('br', null),
        'This is likely due to malformed data or missing functionality in Composer.',
        React.createElement('br', null),
        'Try navigating to another node in the visual editor.'
      ),
      React.createElement('p', null, 'Here\u2019s what we know\u2026'),
      React.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        React.createElement('strong', null, 'Error:'),
        ' ',
        error && error.toString()
      ),
      React.createElement(
        'p',
        { style: { whiteSpace: 'pre-wrap' } },
        React.createElement('strong', null, 'Component Stacktrace:'),
        ' ',
        componentStack
      )
    )
  );
};
var ObiFormEditor = function(props) {
  var onChange = function(data) {
    props.onChange(data, props.focusedSteps[0]);
  };
  var key = get(props.data, '$designer.id', props.focusPath);
  return React.createElement(
    Suspense,
    { fallback: React.createElement(LoadingSpinner, null) },
    React.createElement(
      CacheProvider,
      { value: emotionCache },
      React.createElement(
        ErrorBoundary,
        { key: props.botName + '-' + key, FallbackComponent: ErrorInfo },
        React.createElement(FormEditor, __assign({}, props, { onChange: onChange }))
      )
    )
  );
};
export default ObiFormEditor;
//# sourceMappingURL=ObiFormEditor.js.map
