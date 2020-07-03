// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { runtimeTemplatesState } from './../atoms/appState';
import httpClient from './../../utils/httpUtil';

export const ejectDispatcher = () => {
  const getRuntimeTemplates = useRecoilCallback<[], Promise<void>>(({ set }: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/runtime/templates`);
      set(runtimeTemplatesState, response.data);
    } catch (error) {
      //TODO: error
      console.log(error);
    }
  });

  return {
    getRuntimeTemplates,
  };
};
