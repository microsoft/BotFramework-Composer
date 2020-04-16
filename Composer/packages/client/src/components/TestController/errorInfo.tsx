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

export const ErrorInfo: React.FC<IErrorInfoProps> = (props) => {
  const { hidden, count, onClick } = props;

  if (hidden) return null;

  return (
    <div css={errorInfo} onClick={onClick} data-testid="notifications-info-button">
      <span css={errorCount}>{count}</span>
      <IconButton iconProps={{ iconName: 'ErrorBadge' }} css={errorButton} title="Error" ariaLabel="Error" />
    </div>
  );
};
