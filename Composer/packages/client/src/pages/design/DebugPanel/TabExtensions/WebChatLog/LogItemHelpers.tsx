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

export const renderTimeStamp = (timestamp: number, appLocale: string) => {
  return (
    <span css={timestampStyle}>
      <span css={timestampBracket}>[</span>
      {new Intl.DateTimeFormat(appLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp)}
      <span css={timestampBracket}>]</span>
    </span>
  );
};
