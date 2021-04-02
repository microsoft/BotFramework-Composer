// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

const timestampStyle = css`
  color: ${SharedColors.green20};
  padding-right: 6px;
`;

const timestampBracket = css`
  color: ${NeutralColors.gray130};
`;

export const renderActivityArrow = (activity) => {
  if (activity?.recipient && activity.recipient.role === 'bot') {
    return <span>{'->'}</span>;
  }
  return <span>{'<-'}</span>;
};

export const renderTimeStamp = (timestamp: string) => {
  return (
    <span css={timestampStyle}>
      <span css={timestampBracket}>[</span>
      {new Date(timestamp).toTimeString().substring(0, 8)}
      <span css={timestampBracket}>]</span>
    </span>
  );
};
