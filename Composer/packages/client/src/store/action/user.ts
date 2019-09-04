import { ActionCreator } from '../types';
import { getUserTokenFromCache, refreshTokenPopup } from '../../utils/auth';
import { ActionTypes } from '../../constants';

export const loginUser: ActionCreator = async ({ dispatch }) => {
  if (!process.env.COMPOSER_REQUIRE_AUTH) {
    return;
  }

  const token = getUserTokenFromCache() || (await refreshTokenPopup());

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
