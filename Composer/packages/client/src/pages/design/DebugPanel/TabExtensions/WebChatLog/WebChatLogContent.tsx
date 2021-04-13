// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { ConversationTrafficItem } from '@botframework-composer/types/src';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTrafficState,
  webChatInspectionDataState,
} from '../../../../../recoilModel';
import { DebugPanelTabHeaderProps } from '../types';
import { WebChatInspectionData } from '../../../../../recoilModel/types';

import { WebChatInspectorPane } from './WebChatInspectorPane';
import { WebChatActivityLogItem } from './WebChatActivityLogItem';
import { WebChatNetworkLogItem } from './WebChatNetworkLogItem';

const emptyStateMessage = css`
  padding-left: 16px;
`;

const logContainer = (isActive: boolean) => css`
  height: 100%;
  display: ${!isActive ? 'none' : 'flex'};
  overflow: auto;
  flex-direction: row;
`;

const logPane = css`
  height: 100%;
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  padding: 16px 0;
  box-sizing: border-box;
`;

const itemIsSelected = (item: ConversationTrafficItem, currentInspectionData?: WebChatInspectionData) => {
  return item.id === currentInspectionData?.item?.id;
};

// R12: We are showing Errors from the root bot only.
export const WebChatLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const inspectionData = useRecoilValue(webChatInspectionDataState(currentProjectId ?? ''));
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

  const performInspection = useRef(
    debounce((trafficItem: ConversationTrafficItem) => {
      if (currentProjectId) {
        if (trafficItem?.trafficType === 'network') {
          // default to inspecting the request body
          setWebChatInspectionData(currentProjectId, { item: trafficItem, mode: 'request' });
        } else {
          setWebChatInspectionData(currentProjectId, { item: trafficItem });
        }
      }
    }, 500)
  ).current;

  const inspectLatestLogMessage = () => {
    // inspect latest log message if nothing is being inspected
    if (!inspectionData && currentProjectId) {
      const latestTrafficItem = [...rawWebChatTraffic].pop();
      if (latestTrafficItem) {
        performInspection(latestTrafficItem);
      }
    }
  };

  useEffect(() => {
    if (navigateToLatestEntry && isActive) {
      navigateToNewestLogEntry();
      inspectLatestLogMessage();
      navigateToLatestEntryWhenActive(false);
    }
  }, [isActive, navigateToLatestEntry]);

  useEffect(() => {
    navigateToLatestEntryWhenActive(true);
  }, [currentLogItemCount]);

  const onClickTraffic = useCallback(
    (data: WebChatInspectionData) => {
      if (currentProjectId) {
        setWebChatInspectionData(currentProjectId, data);
      }
    },
    [currentProjectId]
  );

  const renderLogItem = useCallback(
    (item: ConversationTrafficItem, index: number, inspectionData?: WebChatInspectionData) => {
      switch (item.trafficType) {
        case 'activity':
          return (
            <WebChatActivityLogItem
              index={index}
              isSelected={itemIsSelected(item, inspectionData)}
              item={item}
              onClickTraffic={onClickTraffic}
            />
          );

        case 'network':
          return (
            <WebChatNetworkLogItem
              index={index}
              isSelected={itemIsSelected(item, inspectionData)}
              item={item}
              onClickTraffic={onClickTraffic}
            />
          );

        case 'networkError':
          return (
            <WebChatNetworkLogItem
              index={index}
              isSelected={itemIsSelected(item, inspectionData)}
              item={item}
              onClickTraffic={onClickTraffic}
            />
          );

        default:
          return null;
      }
    },
    [onClickTraffic]
  );

  const displayedTraffic = useMemo(() => {
    const renderedTraffic = [...rawWebChatTraffic].map((t, i) => renderLogItem(t, i, inspectionData));
    setLogItemCount(renderedTraffic.length);
    return renderedTraffic;
  }, [inspectionData, rawWebChatTraffic, renderLogItem]);

  const setInspectionData = (data: WebChatInspectionData) => {
    if (currentProjectId) {
      setWebChatInspectionData(currentProjectId, data);
    }
  };

  return (
    <div css={logContainer(isActive)}>
      <div ref={webChatContainerRef} css={logPane} data-testid="Webchat-Logs-Container">
        {displayedTraffic.length ? (
          displayedTraffic
        ) : (
          <span css={emptyStateMessage}>{formatMessage('No Web Chat activity yet.')}</span>
        )}
      </div>
      <WebChatInspectorPane inspectionData={inspectionData} onSetInspectionData={setInspectionData} />
    </div>
  );
};
