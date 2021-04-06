// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { DebugPanelTabHeaderProps } from '../types';

export const OutputsTabLogHeader: React.FC<DebugPanelTabHeaderProps> = () => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      data-testid="Runtime-Logs"
    >
      <div
        css={{
          marginRight: '4px',
        }}
      >
        {formatMessage('Outputs')}
      </div>
    </div>
  );
};
