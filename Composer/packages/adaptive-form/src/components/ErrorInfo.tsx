// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import formatMessage from 'format-message';
import { FallbackProps } from 'react-error-boundary';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

const ErrorInfo: React.FC<FallbackProps> = ({ componentStack, error }) => (
  <div style={{ marginRight: '20px' }}>
    <MessageBar isMultiline={false} messageBarType={MessageBarType.error}>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>{formatMessage({ default: 'An error occured in the form editor!', id: 'ErrorInfo_part1' })}</strong>
        <br />
        {formatMessage({
          default: 'This is likely due to malformed data or missing functionality in Composer.',
          id: 'ErrorInfo_part2',
        })}
        <br />
        {formatMessage({ default: 'Try navigating to another node in the visual editor.', id: 'ErrorInfo_part3' })}
      </p>
      <p>{formatMessage('Here’s what we know…')}</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>{formatMessage('Error:')}</strong> {error && error.toString()}
      </p>
      <p style={{ whiteSpace: 'pre-wrap' }}>
        <strong>{formatMessage('Component Stacktrace:')}</strong> {componentStack}
      </p>
    </MessageBar>
  </div>
);

export default ErrorInfo;
