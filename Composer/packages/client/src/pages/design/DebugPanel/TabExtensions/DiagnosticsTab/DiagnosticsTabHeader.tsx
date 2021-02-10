// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { useDiagnosticsStatistics } from './useDiagnostics';
import { Indicator } from './Indicator';

export const DiagnosticsHeader = () => {
  const { hasError, hasWarning } = useDiagnosticsStatistics();

  const indicator = hasError ? (
    <Indicator color={'#EB3941'} size={5} />
  ) : hasWarning ? (
    <Indicator color={'#F4BD00'} size={5} />
  ) : null;

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
      `}
      data-testid="Tab-Diagnostics"
    >
      <div
        css={css`
          margin-right: ${indicator ? 4 : 0}px;
        `}
      >
        {formatMessage('Issues')}
      </div>
      {indicator}
    </div>
  );
};
