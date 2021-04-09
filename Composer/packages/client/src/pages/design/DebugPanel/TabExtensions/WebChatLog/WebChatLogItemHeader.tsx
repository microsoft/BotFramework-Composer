// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import isEqual from 'lodash/isEqual';

import { rootBotProjectIdSelector, webChatTrafficState } from '../../../../../recoilModel';
import { DebugPanelErrorIndicator } from '../DebugPanelErrorIndicator';
import { DebugPanelTabHeaderProps } from '../types';

export const WebChatLogItemHeader: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const logItems = useRecoilValue(webChatTrafficState(rootBotId ?? ''));

  const [hasUnreadLogs, setHasUnreadLogs] = useState(false);
  const [lastReadLogIds, setLastReadLogIds] = useState<number[]>([]);

  useEffect(() => {
    const newLogIds = logItems.filter((item) => item.trafficType === 'networkError').map((item) => item.timestamp);
    const areLogsSame = isEqual(newLogIds, lastReadLogIds);

    if (!areLogsSame) {
      setLastReadLogIds(newLogIds);
      if (isActive || !logItems.length) {
        setHasUnreadLogs(false);
        return;
      }
      setHasUnreadLogs(true);
    } else {
      setHasUnreadLogs(false);
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
        {formatMessage('Web Chat')}
      </div>
      <DebugPanelErrorIndicator hasError={hasUnreadLogs} />
    </div>
  );
};
