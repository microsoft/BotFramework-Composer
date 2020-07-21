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
        {formatMessage.rich(
          '<strong>Oops! An error occured in the form editor!</strong><br />This is likely due to malformed data or missing functionality in Composer.<br />Try navigating to another node in the visual editor.',
          {
            strong: ({ children }) => <strong>{children}</strong>,
            br: () => <br />,
          }
        )}
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
