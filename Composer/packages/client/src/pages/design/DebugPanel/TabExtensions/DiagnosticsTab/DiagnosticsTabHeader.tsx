// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { DebugPanelErrorIndicator } from '../DebugPanelErrorIndicator';

import { useDiagnosticsStatistics } from './useDiagnostics';

export const DiagnosticsHeader = () => {
  const { hasError, hasWarning } = useDiagnosticsStatistics();

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
          margin-right: ${hasError || hasWarning ? 4 : 0}px;
        `}
      >
        {formatMessage('Problems')}
      </div>
      <DebugPanelErrorIndicator hasError={hasError} hasWarning={hasWarning} />
    </div>
  );
};
