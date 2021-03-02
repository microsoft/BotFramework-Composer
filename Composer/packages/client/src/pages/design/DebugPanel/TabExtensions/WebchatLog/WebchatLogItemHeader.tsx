// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import isEqual from 'lodash/isEqual';

import { rootBotProjectIdSelector, webChatLogsState } from '../../../../../recoilModel';
import { DebugPanelErrorIndicator } from '../DebugPanelErrorIndicator';
import { DebugPanelTabHeaderProps } from '../types';

export const WebChatLogItemHeader: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const logItems = useRecoilValue(webChatLogsState(rootBotId ?? ''));

  const [hasUnreadLog, setHasUnreadLog] = useState(false);
  const [lastReadLogIds, setLastReadLogIds] = useState<string[]>([]);

  useEffect(() => {
    if (isActive || !logItems.length) {
      setHasUnreadLog(false);
      return;
    }

    const newLogIds = logItems.map((item) => item.timestamp);
    if (!isEqual(newLogIds, lastReadLogIds)) {
      setLastReadLogIds(newLogIds);
      if (!isActive) {
        setHasUnreadLog(true);
      }
    }
  }, [logItems, isActive]);

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
          margin-right: 4px;
        `}
      >
        {formatMessage('Webchat Inspector')}
      </div>
      <DebugPanelErrorIndicator hasError={hasUnreadLog} />
    </div>
  );
};
