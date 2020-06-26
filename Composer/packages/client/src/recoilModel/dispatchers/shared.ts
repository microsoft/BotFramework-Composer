/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface } from 'recoil';

import { logEntryListState } from '../atoms/appState';

export const logMessage = ({ set }: CallbackInterface, message: string) => {
  //IMPORTANT: You can't call logMessage multiple times in a callback
  //and use getPromise!  Instead, you must use the updator to get the
  //latest value each time you call set!
  // eslint-disable-next-line no-console
  console.log(message);
  set(logEntryListState, (logEntries) => [...logEntries, message]);
};
