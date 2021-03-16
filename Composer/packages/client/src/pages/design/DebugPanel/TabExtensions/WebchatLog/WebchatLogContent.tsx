// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useEffect, useState, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { rootBotProjectIdSelector } from '../../../../../recoilModel';
import { webChatLogsState } from '../../../../../recoilModel/atoms';
import { DebugPanelTabHeaderProps } from '../types';

import { WebchatLogItem } from './WebchatLogItem';

// R12: We are showing Errors from the root bot only.
export const WebchatLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const displayedLogs = useRecoilValue(webChatLogsState(currentProjectId ?? ''));
  const [navigateToLatestEntry, navigateToLatestEntryWhenActive] = useState(false);
  const [currentLogItemCount, setLogItemCount] = useState<number>(0);
  const webChatContainerRef = useRef<HTMLDivElement | null>(null);

  const webChatItems = useMemo(() => {
    const updatedItems = displayedLogs.map((log, idx) => <WebchatLogItem key={`webchatLog-${idx}`} item={log} />);
    setLogItemCount(displayedLogs.length);
    return updatedItems;
  }, [displayedLogs]);

  const navigateToNewestLogEntry = () => {
    if (currentLogItemCount && webChatContainerRef?.current) {
      const lastChild = webChatContainerRef.current.lastElementChild;
      lastChild?.scrollIntoView();
    }
  };

  useEffect(() => {
    if (navigateToLatestEntry && isActive) {
      navigateToNewestLogEntry();
      navigateToLatestEntryWhenActive(false);
    }
  }, [isActive, navigateToLatestEntry]);

  useEffect(() => {
    navigateToLatestEntryWhenActive(true);
  }, [currentLogItemCount]);

  return (
    <div
      ref={webChatContainerRef}
      css={{
        height: 'calc(100% - 20px)',
        display: !isActive ? 'none' : 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        padding: '16px 24px',
      }}
      data-testid="Webchat-Logs-Container"
    >
      {webChatItems}
    </div>
  );
};
