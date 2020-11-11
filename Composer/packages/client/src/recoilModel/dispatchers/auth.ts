/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CallbackInterface, useRecoilCallback } from 'recoil';
import jwtDecode from 'jwt-decode';

import { currentUserState } from '../atoms/appState';
import { setAccessToken, setGraphToken, getAccessTokenInCache } from '../../utils/auth';
import { isElectron } from '../../utils/electronUtil';

import httpClient from './../../utils/httpUtil';

export const authDispatcher = () => {
  const setCurrentUser = ({ set }: CallbackInterface, token: string) => {
    // decode token and set current user
    let decoded = {} as any;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error(err);
    }
    set(currentUserState, {
      token: token,
      email: decoded.upn,
      name: decoded.name,
      expiration: (decoded.exp || 0) * 1000, // convert to ms,
      sessionExpired: false,
    });
  };

  const getAccessToken = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    try {
      let token;
      if (isElectron()) {
        const result = await httpClient.get(`/auth/getAccessToken`, {
          params: { targetResource: 'https://management.core.windows.net/' },
        });
        setAccessToken(result.data.accessToken);
        token = result.data.accessToken;
      } else {
        token = getAccessTokenInCache();
      }
      setCurrentUser(callbackHelpers, token);
    } catch (err) {
      console.log(err);
    }
  });
  const getGraphToken = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    try {
      if (isElectron()) {
        const result = await httpClient.get(`/auth/getAccessToken`, {
          params: { targetResource: 'https://graph.microsoft.com/' },
        });
        console.log(result.data);
        // set(grahpTokenState, {
        //   token: result.data,
        //   sessionExpired: false,
        // });
        setGraphToken(result.data.accessToken);
      }
    } catch (err) {
      console.log(err);
    }
  });
  return { getAccessToken, getGraphToken };
};
