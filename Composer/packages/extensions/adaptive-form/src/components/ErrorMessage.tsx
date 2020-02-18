// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import formatMessage from 'format-message';

interface ErrorMessageProps {
  label?: string | false;
  error?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = props => {
  const { error, label } = props;

  return (
    <MessageBar
      truncated
      dismissButtonAriaLabel={formatMessage('Close')}
      isMultiline={false}
      messageBarType={MessageBarType.error}
      overflowButtonAriaLabel={formatMessage('See more')}
    >
      {[label, error].filter(Boolean).join(' ')}
    </MessageBar>
  );
};

export { ErrorMessage };
