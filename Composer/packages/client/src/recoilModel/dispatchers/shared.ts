/* eslint-disable no-console */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface } from 'recoil';
import formatMessage from 'format-message';

import { logEntryListState, applicationErrorState } from '../atoms/appState';

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

export const setError = (callbackHelpers: CallbackInterface, payload) => {
  // if the error originated at the server and the server included message, use it...
  if (payload?.status === 409) {
    callbackHelpers.set(applicationErrorState, {
      status: 409,
      message: formatMessage(
        'This version of the content is out of date, and your last change was rejected. The content will be automatically refreshed.'
      ),
      summary: formatMessage('Modification Rejected'),
    });
  } else if (payload?.response?.data?.message) {
    callbackHelpers.set(applicationErrorState, payload.response.data);
  } else if (payload instanceof Error) {
    callbackHelpers.set(applicationErrorState, {
      summary: payload.name,
      message: payload.message,
    });
  } else {
    callbackHelpers.set(applicationErrorState, payload);
  }
  if (payload != null) {
    const message = JSON.stringify(payload);
    logMessage(callbackHelpers, `Error: ${message}`);
  }
};
