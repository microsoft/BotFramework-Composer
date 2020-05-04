// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

interface ErrorMessageProps {
  label?: string | false;
  error?: string;
  helpLink?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = props => {
  const { error, label, helpLink } = props;

  return (
    <MessageBar
      dismissButtonAriaLabel={formatMessage('Close')}
      isMultiline={true}
      messageBarType={MessageBarType.error}
    >
      {[label, error].filter(Boolean).join(' ')}
      {helpLink && (
        <Link key="a" href={helpLink} target="_blank" rel="noopener noreferrer">
          {formatMessage('Refer to the syntax documentation here.')}
        </Link>
      )}
    </MessageBar>
  );
};

export { ErrorMessage };
