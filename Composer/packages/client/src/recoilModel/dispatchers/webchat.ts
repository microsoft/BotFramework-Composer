/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DirectLineLog } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import {
  webChatLogsState,
  webChatTraffic,
  selectedWebChatTrafficItemState,
  isWebChatPanelVisibleState,
} from '../atoms';

export const webChatLogDispatcher = () => {
  const clearWebChatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => (projectId: string) => {
    const { set } = callbackHelpers;
    set(webChatLogsState(projectId), []);
  });

  const appendLogToWebChatInspector = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, log: DirectLineLog) => {
      const { set } = callbackHelpers;
      set(webChatLogsState(projectId), (currentLogs) => [...currentLogs, log]);
    }
  );

  const setWebChatPanelVisibility = useRecoilCallback((callbackHelpers: CallbackInterface) => (value: boolean) => {
    const { set } = callbackHelpers;
    set(isWebChatPanelVisibleState, value);
  });

  const appendTraffic = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, traffic: any | any[]) => {
      const { set } = callbackHelpers;
      set(webChatTraffic(projectId), (currentTraffic) => {
        if (Array.isArray(traffic)) {
          const updatedTraffic = [...currentTraffic, ...traffic];
          return updatedTraffic.sort((t1, t2) => t1.timestamp - t2.timestamp);
        } else {
          const updatedTraffic = [...currentTraffic, traffic];
          return updatedTraffic.sort((t1, t2) => t1.timestamp - t2.timestamp);
        }
      });
    }
  );

  const setSelectedWebChatTrafficItem = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (projectId: string, trafficItem) => {
      const { set } = callbackHelpers;
      set(selectedWebChatTrafficItemState(projectId), trafficItem);
    }
  );

  return {
    clearWebChatLogs,
    appendLogToWebChatInspector,
    appendTraffic,
    setWebChatPanelVisibility,
    setSelectedWebChatTrafficItem,
  };
};
