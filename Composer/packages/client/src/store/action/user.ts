/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import jwtDecode from 'jwt-decode';

import { ActionCreator } from '../types';
import { getUserTokenFromCache, loginPopup, refreshToken } from '../../utils/auth';
import { ActionTypes } from '../../constants';

enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}

const REFRESH_WATERMARK = 1000 * 60 * 5; // 5 minutes

export const loginUser: ActionCreator = async store => {
  if (!process.env.COMPOSER_REQUIRE_AUTH) {
    return;
  }

  const token = getUserTokenFromCache() || (await loginPopup());

  if (token) {
    let decoded = {};

    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error(err);
    }

    store.dispatch({
      type: ActionTypes.USER_LOGIN_SUCCESS,
      payload: {
        token,
        email: decoded[ClaimNames.upn],
        name: decoded[ClaimNames.name],
        expiration: (decoded[ClaimNames.expiration] || 0) * 1000, // convert to ms
      },
    });

    // try to refresh the token before the expiration
    if (decoded[ClaimNames.expiration]) {
      // set timeout to 5 min before expiration
      const refreshTimeout = decoded[ClaimNames.expiration] * 1000 - Date.now() - REFRESH_WATERMARK;

      const updateToken = async () => {
        try {
          await refreshToken();
          loginUser(store);
        } catch (e) {
          console.error('Problem refreshing token');
        }
      };

      setTimeout(() => {
        updateToken();
      }, refreshTimeout);
    }
  } else {
    store.dispatch({
      type: ActionTypes.USER_LOGIN_FAILURE,
    });
  }
};
