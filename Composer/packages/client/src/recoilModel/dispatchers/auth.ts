/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { grahpTokenState, currentUserState } from '../atoms/appState';
import { setAccessToken, setGraphToken } from '../../utils/auth';

import httpClient from './../../utils/httpUtil';

export const authDispatcher = () => {
  const getAccessToken = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    try {
      const result = await httpClient.get(`/auth/getAccessToken`, {
        params: { targetResource: 'https://management.azure.com/' },
      });
      console.log(result.data);
      set(currentUserState, {
        token: result.data.accessToken,
        sessionExpired: false,
      });
      setAccessToken(result.data.accessToken);
    } catch (err) {
      console.log(err);
    }
  });
  const getGraphToken = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    try {
      const result = await httpClient.get(`/auth/getAccessToken`, {
        params: { targetResource: 'https://graph.microsoft.com/' },
      });
      console.log(result.data);
      set(grahpTokenState, {
        token: result.data,
        sessionExpired: false,
      });
      setGraphToken(result.data.accessToken);
    } catch (err) {
      console.log(err);
    }
  });
  return { getAccessToken, getGraphToken };
};
