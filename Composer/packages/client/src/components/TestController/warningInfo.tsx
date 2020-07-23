// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';

// -------------------- Styles -------------------- //

const warningInfo = css`
  float: left;
  display: flex;
`;

const warningButton = css`
  color: ${SharedColors.yellow10};
  &:hover {
    color: ${SharedColors.yellow10};
  }
`;

const warningCount = css`
  height: 32px;
  line-height: 32px;
  font-size 16px;
  cursor: pointer;
  display:inline-block;
`;

// -------------------- warningInfo -------------------- //

interface IwarningInfoProps {
  hidden: boolean;
  count: number;
  onClick: () => void;
}

export const WarningInfo: React.FC<IwarningInfoProps> = (props) => {
  const { hidden, count, onClick } = props;

  if (hidden) return null;

  return (
    <div css={warningInfo} data-testid="notifications-info-button" onClick={onClick}>
      <span css={warningCount}>{count}</span>
      <IconButton ariaLabel="warning" css={warningButton} iconProps={{ iconName: 'Error' }} title="warning" />
    </div>
  );
};
