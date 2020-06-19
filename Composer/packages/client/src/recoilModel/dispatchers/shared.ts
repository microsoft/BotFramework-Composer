/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { logEntryList, applicationError } from '../atoms/appState';
import { StateError } from '../../store/types';

export const logMessage = useRecoilCallback<[string], void>(({ set }: CallbackInterface) => (message: string) => {
  //IMPORTANT: You can't call logMessage multiple times in a callback
  //and use getPromise!  Instead, you must use the updator to get the
  //latest value each time you call set!
  // eslint-disable-next-line no-console
  console.log(message);
  set(logEntryList, (logEntries) => [...logEntries, message]);
});

export const setApplicationLevelError = useRecoilCallback<[StateError], void>(
  ({ set }: CallbackInterface) => (errorObj: StateError) => {
    set(applicationError, errorObj);
  }
);
