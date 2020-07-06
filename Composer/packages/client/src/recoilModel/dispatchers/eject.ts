// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { runtimeTemplatesState } from './../atoms/appState';
import httpClient from './../../utils/httpUtil';
import { logMessage } from './shared';

export const ejectDispatcher = () => {
  const getRuntimeTemplates = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/runtime/templates`);
      set(runtimeTemplatesState, response.data);
    } catch (error) {
      //TODO: error
      logMessage(callbackHelpers, error.message);
    }
  });

  return {
    getRuntimeTemplates,
  };
};
