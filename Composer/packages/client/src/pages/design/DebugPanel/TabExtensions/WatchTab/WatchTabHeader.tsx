// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';

import { DebugPanelTabHeaderProps } from '../types';

export const WatchTabHeader: React.FC<DebugPanelTabHeaderProps> = () => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
      `}
      data-testid="Tab-Watch"
    >
      <div
        css={css`
          margin-right: 4px;
        `}
      >
        {formatMessage('Watch')}
      </div>
    </div>
  );
};
