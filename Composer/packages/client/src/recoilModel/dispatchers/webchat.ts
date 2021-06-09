/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConversationTrafficItem, Activity } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import {
  webChatTrafficState,
  webChatInspectionDataState,
  isWebChatPanelVisibleState,
  botStateInspectionDataState,
  inspectedBotStateIndexState,
} from '../atoms';
import { WebChatInspectionData } from '../types';

export const webChatLogDispatcher = () => {
  const clearWebChatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => (projectId: string) => {
    const { set } = callbackHelpers;
    set(webChatTrafficState(projectId), []);
    set(webChatInspectionDataState(projectId), undefined); // clear the inspection panel
    set(botStateInspectionDataState(projectId), undefined);
    set(inspectedBotStateIndexState(projectId), undefined);
  });

  const setWebChatPanelVisibility = useRecoilCallback((callbackHelpers: CallbackInterface) => (value: boolean) => {
    const { set } = callbackHelpers;
    set(isWebChatPanelVisibleState, value);
  });

  const appendWebChatTraffic = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (
      projectId: string,
      traffic: ConversationTrafficItem | ConversationTrafficItem[]
    ) => {
      const { set } = callbackHelpers;
      set(webChatTrafficState(projectId), (currentTraffic) => {
        if (Array.isArray(traffic)) {
          return [...currentTraffic, ...traffic].sort((t1, t2) => t1.timestamp - t2.timestamp);
        } else {
          return [...currentTraffic, traffic].sort((t1, t2) => t1.timestamp - t2.timestamp);
        }
      });
    }
  );

  const setWebChatInspectionData = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, inspectionData: WebChatInspectionData) => {
      const { set } = callbackHelpers;
      set(webChatInspectionDataState(projectId), inspectionData);
    }
  );

  const setBotStateInspectionData = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, inspectionData: Activity) => {
      const { set } = callbackHelpers;
      set(botStateInspectionDataState(projectId), inspectionData);
    }
  );

  const setInspectedBotStateIndex = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, botStateIndex: number) => {
      const { set } = callbackHelpers;
      set(inspectedBotStateIndexState(projectId), botStateIndex);
    }
  );

  return {
    clearWebChatLogs,
    appendWebChatTraffic,
    setBotStateInspectionData,
    setInspectedBotStateIndex,
    setWebChatPanelVisibility,
    setWebChatInspectionData,
  };
};
