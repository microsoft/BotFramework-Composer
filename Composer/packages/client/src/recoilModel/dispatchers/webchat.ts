/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DirectLineLog } from '@botframework-composer/types';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { webChatLogsState, isWebChatPanelVisibleState } from '../atoms';

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

  return {
    clearWebChatLogs,
    appendLogToWebChatInspector,
    setWebChatPanelVisibility,
  };
};
