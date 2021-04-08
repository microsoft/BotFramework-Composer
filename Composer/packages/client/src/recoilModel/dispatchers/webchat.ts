/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConversationTrafficItem } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { v4 as uuid } from 'uuid';

import { webChatTrafficState, webChatInspectionDataState, isWebChatPanelVisibleState } from '../atoms';
import { WebChatInspectionData } from '../types';

const addIdToTrafficItem = (item: ConversationTrafficItem) => {
  if (!item.id) {
    item.id = uuid();
  }
  return item;
};

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
          return [...currentTraffic, ...traffic.map((item) => addIdToTrafficItem(item))].sort(
            (t1, t2) => t1.timestamp - t2.timestamp
          );
        } else {
          return [...currentTraffic, addIdToTrafficItem(traffic)].sort((t1, t2) => t1.timestamp - t2.timestamp);
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

  return {
    clearWebChatLogs,
    appendWebChatTraffic,
    setWebChatPanelVisibility,
    setWebChatInspectionData,
  };
};
