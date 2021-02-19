/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebchatLog } from '@botframework-composer/types/src';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { webchatLogsState } from '../atoms/webchatState';

export const webchatLogDispatcher = () => {
  const clearWebchatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => (projectId: string) => {
    const { set } = callbackHelpers;
    set(webchatLogsState(projectId), []);
  });

  const appendWebchatLog = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, log: WebchatLog) => {
      const { set } = callbackHelpers;
      set(webchatLogsState(projectId), (currentLogs) => [...currentLogs, log]);
    }
  );

  const appendWebchatLogs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, logs: WebchatLog[]) => {
      const { set } = callbackHelpers;
      set(webchatLogsState(projectId), (currentLogs) => [...currentLogs, ...logs]);
    }
  );

  return {
    clearWebchatLogs,
    appendWebchatLog,
    appendWebchatLogs,
  };
};
