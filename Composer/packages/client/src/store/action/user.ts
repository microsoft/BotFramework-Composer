import { ActionCreator } from '../types';
import { getUserTokenFromCache, refreshTokenPopup } from '../../utils/auth';
import { ActionTypes } from '../../constants';

export const loginUser: ActionCreator = async ({ dispatch }) => {
  if (!process.env.COMPOSER_REQUIRE_AUTH) {
    return;
  }

  const cachedToken = getUserTokenFromCache();

  if (cachedToken) {
    dispatch({
      type: ActionTypes.USER_LOGIN_SUCCESS,
      payload: {
        token: cachedToken,
      },
    });
    return;
  }

  const token = await refreshTokenPopup();

  if (token) {
    dispatch({
      type: ActionTypes.USER_LOGIN_SUCCESS,
      payload: {
        token,
      },
    });
  } else {
    dispatch({
      type: ActionTypes.USER_LOGIN_FAILURE,
    });
  }
};
