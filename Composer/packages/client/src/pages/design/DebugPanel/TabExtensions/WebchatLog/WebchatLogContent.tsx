// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ConversationTrafficItem,
  ConversationActivityTrafficItem,
  ConversationNetworkTrafficItem,
} from '@botframework-composer/types/src';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTraffic,
  webChatInspectionData,
} from '../../../../../recoilModel';
import { webChatLogsState } from '../../../../../recoilModel/atoms';
import { DebugPanelTabHeaderProps } from '../types';
import { WebChatInspectionData } from '../../../../../recoilModel/types';

import { WebchatLogItem } from './WebchatLogItem';
import { WebChatInspectorPane } from './WebChatInspectorPane';

const isActive = false; // TODO: put this into a component
const hoverItem = css`
  padding: 0 16px;
  background-color: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
  &:hover {
    background-color: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
`;

const pointer = css`
  cursor: pointer;
`;

const link = css`
  text-decoration: underline;
  color: ${SharedColors.blue10};
  display: inline-block;
  padding-right: 4px;
`;

const timestampStyle = css`
  color: ${SharedColors.green20};
  padding-right: 6px;
`;

const timestampBracket = css`
  color: ${NeutralColors.gray130};
`;

const emptyStateMessage = css`
  padding-left: 16px;
`;

const getActivityDirection = (activity) => {
  if (activity?.recipient && activity.recipient.role === 'bot') {
    return <span>{'->'}</span>;
  }
  return <span>{'<-'}</span>;
};

// R12: We are showing Errors from the root bot only.
export const WebchatLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const displayedLogs = useRecoilValue(webChatLogsState(currentProjectId ?? ''));
  const displayedTraffic = useRecoilValue(webChatTraffic(currentProjectId ?? ''));
  const inspectionData = useRecoilValue(webChatInspectionData(currentProjectId ?? ''));
  const [navigateToLatestEntry, navigateToLatestEntryWhenActive] = useState(false);
  const [currentLogItemCount, setLogItemCount] = useState<number>(0);
  const webChatContainerRef = useRef<HTMLDivElement | null>(null);
  const { setWebChatInspectionData } = useRecoilValue(dispatcherState);

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

  const onClickTraffic = useCallback((data: WebChatInspectionData) => {
    if (currentProjectId) {
      setWebChatInspectionData(currentProjectId, data);
    }
  }, []);

  const renderLogItem = (item: ConversationTrafficItem, index: number) => {
    switch (item.trafficType) {
      case 'network':
        return renderNetworkLogItem(item, index);

      case 'activity':
        return renderActivityLogItem(item, index);

      default:
        return null;
    }
  };

  const renderTimeStamp = (timestamp: string) => {
    return (
      <span css={timestampStyle}>
        <span css={timestampBracket}>[</span>
        {new Date(timestamp).toTimeString().substring(0, 8)}
        <span css={timestampBracket}>]</span>
      </span>
    );
  };

  const renderNetworkLogItem = (item: ConversationNetworkTrafficItem, index: number) => {
    const boundOnClickRequest = () => {
      onClickTraffic({ item, mode: 'request' });
    };
    const boundOnClickResponse = () => {
      onClickTraffic({ item, mode: 'response' });
    };
    return (
      <span key={`webchat-network-item-${index}`} css={hoverItem}>
        {renderTimeStamp(item.timestamp)}
        <span css={[pointer, link]} onClick={boundOnClickRequest}>
          {`${item.request.method}`}
        </span>
        <span css={[pointer, link]} onClick={boundOnClickResponse}>
          {`${item.response.statusCode}`}
        </span>
        {item.request.route}
      </span>
    );
  };

  const renderActivityLogItem = (item: ConversationActivityTrafficItem, index: number) => {
    const boundOnClickTraffic = () => {
      onClickTraffic({ item });
    };
    return (
      <span key={`webchat-activity-item-${index}`} css={[hoverItem, pointer]} onClick={boundOnClickTraffic}>
        {renderTimeStamp(item.timestamp)}
        {getActivityDirection(item.activity)}
        <span css={link}>{item.activity.type || 'no type found'}</span>
        {item.activity.type === 'message' && item.activity.text}
      </span>
    );
  };

  const setInspectionData = (data: WebChatInspectionData) => {
    if (currentProjectId) {
      setWebChatInspectionData(currentProjectId, data);
    }
  };

  const copiedTraffic = [...displayedTraffic];

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
          padding: '16px 0',
          boxSizing: 'border-box',
        }}
        data-testid="Webchat-Logs-Container"
      >
        {webChatItems}
        {copiedTraffic.length ? (
          copiedTraffic
            .sort((t1, t2) => new Date(t1.timestamp).getTime() - new Date(t2.timestamp).getTime())
            .map((t, i) => renderLogItem(t, i))
        ) : (
          <span css={emptyStateMessage}>No Web Chat activity yet.</span>
        )}
      </div>
      <WebChatInspectorPane inspectionData={inspectionData} setInspectionData={setInspectionData} />
    </div>
  );
};
