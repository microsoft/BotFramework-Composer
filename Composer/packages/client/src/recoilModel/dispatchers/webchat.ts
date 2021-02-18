/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebchatLog } from '@botframework-composer/types/src';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import { webchatLogsState } from '../atoms/webchatState';

export const webchatLogDispatcher = () => {
  const clearWebchatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => () => {
    const { set } = callbackHelpers;
    set(webchatLogsState, []);
  });

  const appendWebchatLog = useRecoilCallback((callbackHelpers: CallbackInterface) => async (log: WebchatLog) => {
    const { snapshot, set } = callbackHelpers;
    const currentlogs = await snapshot.getPromise(webchatLogsState);
    set(webchatLogsState, [...currentlogs, log]);
  });

  const appendWebchatLogs = useRecoilCallback((callbackHelpers: CallbackInterface) => async (logs: WebchatLog[]) => {
    const { snapshot, set } = callbackHelpers;
    const currentlogs = await snapshot.getPromise(webchatLogsState);
    set(webchatLogsState, [...currentlogs, ...logs]);
  });

  return {
    clearWebchatLogs,
    appendWebchatLog,
    appendWebchatLogs,
  };
};
