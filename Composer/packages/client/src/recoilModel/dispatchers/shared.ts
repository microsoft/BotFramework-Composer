/* eslint-disable no-console */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface } from 'recoil';

import { logEntryListState } from '../atoms/appState';

export enum ConsoleMsgLevel {
  Error,
  Warn,
  Info,
}

export const logMessage = ({ set }: CallbackInterface, message: string, level = ConsoleMsgLevel.Error) => {
  //IMPORTANT: You can't call logMessage multiple times in a callback
  //and use getPromise!  Instead, you must use the updator to get the
  //latest value each time you call set!
  switch (level) {
    case ConsoleMsgLevel.Info:
      console.log(message);
      break;
    case ConsoleMsgLevel.Warn:
      console.warn(message);
      break;
    default:
      console.error(message);
      break;
  }
  set(logEntryListState, (logEntries) => [...logEntries, message]);
};
