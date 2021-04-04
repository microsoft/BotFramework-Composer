// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { DebugPanelTabHeaderProps } from '../types';

export const RuntimeOutputLogHeader: React.FC<DebugPanelTabHeaderProps> = () => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
      `}
      data-testid="Runtime-Logs"
    >
      <div
        css={css`
          margin-right: 4px;
        `}
      >
        {formatMessage('Outputs')}
      </div>
    </div>
  );
};
