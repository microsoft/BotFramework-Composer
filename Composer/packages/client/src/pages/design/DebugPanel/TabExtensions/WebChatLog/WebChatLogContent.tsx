// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { ConversationTrafficItem } from '@botframework-composer/types/src';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  rootBotProjectIdSelector,
  webChatTrafficState,
  webChatInspectionDataState,
  botStatusState,
  isWebChatPanelVisibleState,
} from '../../../../../recoilModel';
import { DebugPanelTabHeaderProps } from '../types';
import { WebChatInspectionData } from '../../../../../recoilModel/types';
import { BotStatus } from '../../../../../constants';
import { useBotOperations } from '../../../../../components/BotRuntimeController/useBotOperations';
import { usePVACheck } from '../../../../../hooks/usePVACheck';

import { WebChatInspectorPane } from './WebChatInspectorPane';
import { WebChatActivityLogItem } from './WebChatActivityLogItem';
import { WebChatNetworkLogItem } from './WebChatNetworkLogItem';

const logContainer = (isActive: boolean) => css`
  height: 100%;
  display: ${!isActive ? 'none' : 'flex'};
  overflow: auto;
  flex-direction: row;
`;

const logPane = (trafficLength: number) => css`
  height: 100%;
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  padding: ${trafficLength ? '16px 0' : '4px 0'};
  box-sizing: border-box;
`;

const emptyStateMessageContainer = css`
  padding: 0px 16px;
  font-size: 12px;
`;

const actionButton = {
  root: {
    fontSize: 12,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
  },
};

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
  const { setWebChatInspectionData, setWebChatPanelVisibility } = useRecoilValue(dispatcherState);
  const currentStatus = useRecoilValue(botStatusState(currentProjectId ?? ''));
  const isWebChatPanelVisible = useRecoilValue(isWebChatPanelVisibleState);
  const { startAllBots } = useBotOperations();
  const isPVABot = usePVACheck(currentProjectId ?? '');
  const [isWebChatPanelOpenedOnce, setIsWebChatPanelOpenedOnce] = useState(false);

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
    if (isWebChatPanelVisible && !isWebChatPanelOpenedOnce) {
      setIsWebChatPanelOpenedOnce(true);
    }
  }, [isWebChatPanelVisible]);

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
              key={`webchat-activity-item-${index}`}
              isSelected={itemIsSelected(item, inspectionData)}
              item={item}
              onClickTraffic={onClickTraffic}
            />
          );

        case 'network':
          return (
            <WebChatNetworkLogItem
              key={`webchat-network-item-${index}`}
              isSelected={itemIsSelected(item, inspectionData)}
              item={item}
              onClickTraffic={onClickTraffic}
            />
          );

        case 'networkError':
          return (
            <WebChatNetworkLogItem
              key={`webchat-network-item-${index}`}
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

  const onOpenWebChatPanelClick = () => {
    setWebChatPanelVisibility(true);
  };

  const noWebChatTrafficSection = useMemo(() => {
    if (isPVABot) {
      return null;
    }

    if (currentStatus === BotStatus.inactive) {
      return (
        <div css={emptyStateMessageContainer}>
          {formatMessage.rich('Your bot project is not running. <actionButton>Start your bot</actionButton>', {
            actionButton: ({ children }) => (
              <ActionButton key="webchat-tab-startbot" styles={actionButton} type="button" onClick={startAllBots}>
                {children}
              </ActionButton>
            ),
          })}
        </div>
      );
    }

    if (currentStatus === BotStatus.connected) {
      return (
        <div css={emptyStateMessageContainer}>
          {formatMessage.rich('Your bot project is running. <actionButton>Test in Web Chat</actionButton>', {
            actionButton: ({ children }) => (
              <ActionButton key="webchat-tab-openWC" styles={actionButton} onClick={onOpenWebChatPanelClick}>
                {children}
              </ActionButton>
            ),
          })}
        </div>
      );
    }
    return null;
  }, [currentStatus]);

  return (
    <div css={logContainer(isActive)}>
      <div ref={webChatContainerRef} css={logPane(displayedTraffic.length)} data-testid="Webchat-Logs-Container">
        {displayedTraffic.length || isWebChatPanelOpenedOnce ? displayedTraffic : noWebChatTrafficSection}
      </div>
      <WebChatInspectorPane inspectionData={inspectionData} onSetInspectionData={setInspectionData} />
    </div>
  );
};
