// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { ConversationActivityTrafficItem } from '@botframework-composer/types';

import { DebugPanelTabHeaderProps } from '../types';
import {
  rootBotProjectIdSelector,
  webChatTrafficState,
  dispatcherState,
  inspectedBotStateIndexState,
} from '../../../../../recoilModel';
import { WebChatActivityLogItem } from '../WebChatLog/WebChatActivityLogItem';
import { WebChatInspectionData } from '../../../../../recoilModel/types';

import { BotStateInspectorPane } from './BotStateInspectorPane';

const itemIsSelected = (itemIndex: number, currentlyInspectedIndex?: number) => {
  return itemIndex === currentlyInspectedIndex;
};

const logContainer = css`
  height: 100%;
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: row;
`;

const logPane = (trafficLength: number) => css`
  height: 100%;
  width: 50%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  padding: ${trafficLength ? '16px 0' : '4px 0'};
  box-sizing: border-box;
`;

export const BotStateLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const inspectedBotStateIndex = useRecoilValue(inspectedBotStateIndexState(currentProjectId ?? ''));
  const { setBotStateInspectionData, setInspectedBotStateIndex } = useRecoilValue(dispatcherState);

  const onClickTraffic = useCallback(
    (data: WebChatInspectionData, index: number) => {
      if (currentProjectId && data.item.trafficType === 'activity') {
        console.log('clicking ', data);
        setBotStateInspectionData(currentProjectId, data.item.activity);
        setInspectedBotStateIndex(currentProjectId, index);
      }
    },
    [currentProjectId]
  );

  const botStateTraffic = useMemo(() => {
    return rawWebChatTraffic.filter(
      (t) => t.trafficType === 'activity' && t.activity.type === 'trace' && t.activity.name === 'BotState'
    ) as ConversationActivityTrafficItem[];
  }, [rawWebChatTraffic]);

  if (isActive) {
    return (
      <div css={logContainer}>
        <div css={logPane(botStateTraffic.length)}>
          {botStateTraffic.map((botStateTrace, index) => {
            const onClickTrafficWrapper = (data: WebChatInspectionData) => {
              onClickTraffic(data, index);
            };
            return (
              <WebChatActivityLogItem
                key={`webchat-activity-item-${index}`}
                isSelected={itemIsSelected(index, inspectedBotStateIndex)}
                item={botStateTrace}
                onClickTraffic={onClickTrafficWrapper}
              />
            );
          })}
        </div>
        <BotStateInspectorPane botStateTraffic={botStateTraffic} />
      </div>
    );
  } else {
    return null;
  }
};
