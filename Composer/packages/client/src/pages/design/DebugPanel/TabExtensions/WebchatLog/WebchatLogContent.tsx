// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { JsonEditor } from '@bfc/code-editor';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTraffic,
  selectedWebChatTrafficItemState,
} from '../../../../../recoilModel';
import { webChatLogsState } from '../../../../../recoilModel/atoms';
import { DebugPanelTabHeaderProps } from '../types';

import { WebchatLogItem } from './WebchatLogItem';

// R12: We are showing Errors from the root bot only.
export const WebchatLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const displayedLogs = useRecoilValue(webChatLogsState(currentProjectId ?? ''));
  const displayedTraffic = useRecoilValue(webChatTraffic(currentProjectId ?? ''));
  const selectedTraffic = useRecoilValue(selectedWebChatTrafficItemState(currentProjectId ?? ''));
  const [navigateToLatestEntry, navigateToLatestEntryWhenActive] = useState(false);
  const [currentLogItemCount, setLogItemCount] = useState<number>(0);
  const webChatContainerRef = useRef<HTMLDivElement | null>(null);
  const { setSelectedWebChatTrafficItem } = useRecoilValue(dispatcherState);

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

  const onClickTraffic = useCallback((trafficItem) => {
    if (currentProjectId) {
      setSelectedWebChatTrafficItem(currentProjectId, trafficItem);
    }
  }, []);

  return (
    <div
      css={{
        height: '100%',
        display: !isActive ? 'none' : 'flex',
        overflow: 'auto',
        flexDirection: 'row',
      }}
    >
      <div
        ref={webChatContainerRef}
        css={{
          height: '100%',
          width: '50%',
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
          padding: '16px 24px',
          boxSizing: 'border-box',
        }}
        data-testid="Webchat-Logs-Container"
      >
        {webChatItems}
        {displayedTraffic.map((t) => {
          console.log(t);
          const boundOnClickTraffic = () => onClickTraffic(t);
          return (
            <span key={t.id} onClick={boundOnClickTraffic}>
              {t.type || 'no type found'}
            </span>
          );
        })}
      </div>
      <div
        ref={webChatContainerRef}
        css={{
          height: '100%',
          width: '50%',
          borderLeft: '1px solid black',
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <JsonEditor
          editorSettings={{ fadedWhenReadOnly: false }}
          options={{ folding: true, showFoldingControls: 'always', readOnly: true }}
          value={selectedTraffic}
          onChange={(data) => null}
        />
        {/* {JSON.stringify(selectedTraffic, undefined, 2)} */}
      </div>
    </div>
  );
};
