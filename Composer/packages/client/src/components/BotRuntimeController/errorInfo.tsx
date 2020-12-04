// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

// -------------------- Styles -------------------- //

const errorInfo = css`
  float: left;
  display: flex;
`;

const errorButton = css`
  color: ${SharedColors.red20};
  &:hover {
    color: ${SharedColors.red20};
  }
`;

const errorCount = css`
  height: 32px;
  line-height: 32px;
  font-size 16px;
  cursor: pointer;
  display:inline-block;
`;

// -------------------- ErrorInfo -------------------- //

interface IErrorInfoProps {
  hidden: boolean;
  count: number;
  onClick: () => void;
}

export const ErrorInfo: React.FC<IErrorInfoProps> = (props) => {
  const { hidden, count, onClick } = props;

  if (hidden) return null;

  return (
    <div css={errorInfo} data-testid="notifications-info-button" onClick={onClick}>
      <span css={errorCount}>{count}</span>
      <IconButton
        ariaLabel={formatMessage('Error')}
        css={errorButton}
        iconProps={{ iconName: 'ErrorBadge' }}
        title={formatMessage('Error')}
      />
    </div>
  );
};
