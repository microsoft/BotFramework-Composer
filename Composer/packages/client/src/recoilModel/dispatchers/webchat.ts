/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConversationTrafficItem } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { ChatData } from '../../components/WebChat/types';
import {
  webChatTrafficState,
  webChatInspectionDataState,
  isWebChatPanelVisibleState,
  currentWebChatConversationState,
  webChatDataState,
} from '../atoms';
import { WebChatInspectionData } from '../types';

export const webChatLogDispatcher = () => {
  const clearWebChatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => (projectId: string) => {
    const { set } = callbackHelpers;
    set(webChatTrafficState(projectId), []);
    set(webChatInspectionDataState(projectId), undefined); // clear the inspection panel
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

  const setCurrentConversation = useRecoilCallback((callbackHelpers: CallbackInterface) => (conversationId: string) => {
    const { set } = callbackHelpers;
    set(currentWebChatConversationState, conversationId);
  });

  const setWebChatData = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (chatData: Record<string, ChatData>) => {
      const { set } = callbackHelpers;
      set(webChatDataState, chatData);
    }
  );

  return {
    clearWebChatLogs,
    appendWebChatTraffic,
    setWebChatPanelVisibility,
    setWebChatInspectionData,
    setCurrentConversation,
    setWebChatData,
  };
};
