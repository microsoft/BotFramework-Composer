/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConversationTrafficItem } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { webChatTraffic, webChatInspectionData, isWebChatPanelVisibleState } from '../atoms';
import { WebChatInspectionData } from '../types';

export const webChatLogDispatcher = () => {
  const clearWebChatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => (projectId: string) => {
    const { set } = callbackHelpers;
    set(webChatTraffic(projectId), []);
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
      set(webChatTraffic(projectId), (currentTraffic) => {
        if (Array.isArray(traffic)) {
          return [...currentTraffic, ...traffic];
        } else {
          return [...currentTraffic, traffic];
        }
      });
    }
  );

  const setWebChatInspectionData = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, inspectionData: WebChatInspectionData) => {
      const { set } = callbackHelpers;
      set(webChatInspectionData(projectId), inspectionData);
    }
  );

  return {
    clearWebChatLogs,
    appendWebChatTraffic,
    setWebChatPanelVisibility,
    setWebChatInspectionData,
  };
};
