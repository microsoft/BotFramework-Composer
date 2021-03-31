// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ConversationTrafficItem,
  ConversationActivityTrafficItem,
  ConversationNetworkTrafficItem,
} from '@botframework-composer/types/src';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { ConversationNetworkErrorItem } from '@botframework-composer/types';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTraffic,
  webChatInspectionData,
} from '../../../../../recoilModel';
import { DebugPanelTabHeaderProps } from '../types';
import { WebChatInspectionData } from '../../../../../recoilModel/types';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';

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

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();
const logItem = css`
  fontSize: ${DEFAULT_FONT_SETTINGS.fontSize},
  fontFamily: ${DEFAULT_FONT_SETTINGS.fontFamily},
`;

const networkItem = css`
  display: flex;
  flex-direction: column;
`;

const emphasizedText = css`
  color: ${NeutralColors.black};
`;

const redErrorText = css`
  color: ${SharedColors.red20};
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
export const WebChatLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTraffic(currentProjectId ?? ''));
  const inspectionData = useRecoilValue(webChatInspectionData(currentProjectId ?? ''));
  const [navigateToLatestEntry, navigateToLatestEntryWhenActive] = useState(false);
  const [currentLogItemCount, setLogItemCount] = useState<number>(0);
  const webChatContainerRef = useRef<HTMLDivElement | null>(null);
  const { setWebChatInspectionData } = useRecoilValue(dispatcherState);

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

  const renderTimeStamp = (timestamp: string) => {
    return (
      <span css={timestampStyle}>
        <span css={timestampBracket}>[</span>
        {new Date(timestamp).toTimeString().substring(0, 8)}
        <span css={timestampBracket}>]</span>
      </span>
    );
  };

  const renderNetworkLogItem = (item: ConversationNetworkTrafficItem | ConversationNetworkErrorItem, index: number) => {
    const boundOnClickRequest = () => {
      onClickTraffic({ item, mode: 'request' });
    };
    const boundOnClickResponse = () => {
      onClickTraffic({ item, mode: 'response' });
    };
    const errorContent =
      item.trafficType === 'networkError' ? (
        <React.Fragment>
          <span css={redErrorText}>{item.error.message}</span>
          <span css={emphasizedText}>{item.error.details}</span>
        </React.Fragment>
      ) : null;

    return (
      <div key={`webchat-network-item-${index}`} css={[logItem, hoverItem, networkItem]}>
        <span>
          {renderTimeStamp(item.timestamp)}
          <span css={[pointer, link]} onClick={boundOnClickRequest}>
            {`${item.request.method}`}
          </span>
          <span css={[pointer, link]} onClick={boundOnClickResponse}>
            {`${item.response.statusCode}`}
          </span>
          {item.request.route}
        </span>
        {errorContent}
      </div>
    );
  };

  const renderActivityLogItem = (item: ConversationActivityTrafficItem, index: number) => {
    const boundOnClickTraffic = () => {
      onClickTraffic({ item });
    };
    return (
      <span key={`webchat-activity-item-${index}`} css={[logItem, hoverItem, pointer]} onClick={boundOnClickTraffic}>
        {renderTimeStamp(item.timestamp)}
        {getActivityDirection(item.activity)}
        <span css={link}>{item.activity.type || 'no type found'}</span>
        {item.activity.type === 'message' ? <span css={emphasizedText}>{item.activity.text}</span> : null}
      </span>
    );
  };

  const renderLogItem = (item: ConversationTrafficItem, index: number) => {
    switch (item.trafficType) {
      case 'activity':
        return renderActivityLogItem(item, index);

      case 'network':
        return renderNetworkLogItem(item, index);

      case 'networkError':
        return renderNetworkLogItem(item, index);

      default:
        return null;
    }
  };

  const displayedTraffic = useMemo(() => {
    const sortedTraffic = [...rawWebChatTraffic]
      .sort((t1, t2) => new Date(t1.timestamp).getTime() - new Date(t2.timestamp).getTime())
      .map((t, i) => renderLogItem(t, i));
    setLogItemCount(sortedTraffic.length);
    return sortedTraffic;
  }, [rawWebChatTraffic]);

  const setInspectionData = (data: WebChatInspectionData) => {
    if (currentProjectId) {
      setWebChatInspectionData(currentProjectId, data);
    }
  };

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
          width: '100%',
          display: 'flex',
          overflow: 'auto',
          flexDirection: 'column',
          padding: '16px 0',
          boxSizing: 'border-box',
        }}
        data-testid="Webchat-Logs-Container"
      >
        {displayedTraffic.length ? displayedTraffic : <span css={emptyStateMessage}>No Web Chat activity yet.</span>}
      </div>
      <WebChatInspectorPane inspectionData={inspectionData} setInspectionData={setInspectionData} />
    </div>
  );
};
