// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { errorButton, errorCount, errorInfo } from './styles';

interface IErrorInfoProps {
  hidden: boolean;
  count: number;
  onClick: () => void;
}

export const ErrorInfo: React.FC<IErrorInfoProps> = props => {
  const { hidden, count, onClick } = props;

  if (hidden) return null;

  return (
    <div css={errorInfo} data-testid="notifications-info-button" onClick={onClick}>
      <span css={errorCount}>{count}</span>
      <IconButton ariaLabel="Error" css={errorButton} iconProps={{ iconName: 'ErrorBadge' }} title="Error" />
    </div>
  );
};
