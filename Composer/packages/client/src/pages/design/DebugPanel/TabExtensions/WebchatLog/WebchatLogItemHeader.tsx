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

export const WebChatLogItemHeader = (props: { isActive: boolean }) => {
  const { isActive } = props;
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const logItems = useRecoilValue(webChatLogsState(rootBotId ?? ''));
  const [unreadMessageIndicatorVisible, showUnreadMessageIndicator] = useState(false);
  const [currentLogItems, setCurrentLocalItems] = useState<string[]>([]);

  useEffect(() => {
    console.log('CurrentItems', currentLogItems);
    console.log('isactive', isActive);
    if (isActive) {
      showUnreadMessageIndicator(false);
    }
    const newItems = logItems.map((item) => item.timestamp);
    if (!isEqual(newItems, currentLogItems)) {
      setCurrentLocalItems(newItems);
      if (!isActive) {
        showUnreadMessageIndicator(true);
      }
    }

    return () => {
      console.log('Destroyed');
    };
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
      <DebugPanelErrorIndicator hasError={unreadMessageIndicatorVisible} />
    </div>
  );
};
