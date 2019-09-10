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
