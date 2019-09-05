import jwtDecode from 'jwt-decode';

import { ActionCreator } from '../types';
import { getUserTokenFromCache, refreshTokenPopup } from '../../utils/auth';
import { ActionTypes } from '../../constants';

enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}

export const loginUser: ActionCreator = async ({ dispatch }) => {
  if (!process.env.COMPOSER_REQUIRE_AUTH) {
    return;
  }

  const token = getUserTokenFromCache() || (await refreshTokenPopup());

  if (token) {
    let decoded = {};

    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error(err);
    }

    dispatch({
      type: ActionTypes.USER_LOGIN_SUCCESS,
      payload: {
        token,
        email: decoded[ClaimNames.upn],
        name: decoded[ClaimNames.name],
        expiration: (decoded[ClaimNames.expiration] || 0) * 1000, // convert to ms
      },
    });
  } else {
    dispatch({
      type: ActionTypes.USER_LOGIN_FAILURE,
    });
  }
};
