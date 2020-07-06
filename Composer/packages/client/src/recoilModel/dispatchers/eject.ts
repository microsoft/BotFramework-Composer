// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface } from 'recoil';

import { runtimeTemplatesState } from './../atoms/appState';
import httpClient from './../../utils/httpUtil';
import { logMessage } from './shared';

export const ejectDispatcher = {
  getRuntimeTemplates: (callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/runtime/templates`);
      set(runtimeTemplatesState, response.data);
    } catch (error) {
      //TODO: error
      logMessage(callbackHelpers, error.message);
    }
  },
};
