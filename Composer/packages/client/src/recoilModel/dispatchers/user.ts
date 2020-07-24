/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import jwtDecode from 'jwt-decode';

import { userSettingsState, currentUserState, CurrentUser } from '../atoms/appState';
import { getUserTokenFromCache, loginPopup, refreshToken } from '../../utils/auth';
import { UserSettingsPayload } from '../types';

enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}

const REFRESH_WATERMARK = 1000 * 60 * 5; // 5 minutes

export const userDispatcher = () => {
  const loginUser = useRecoilCallback(({ set }: CallbackInterface) => async () => {
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

      set(currentUserState, {
        token,
        email: decoded[ClaimNames.upn],
        name: decoded[ClaimNames.name],
        expiration: (decoded[ClaimNames.expiration] || 0) * 1000, // convert to ms,
        sessionExpired: false,
      });

      // try to refresh the token before the expiration
      if (decoded[ClaimNames.expiration]) {
        // set timeout to 5 min before expiration
        const refreshTimeout = decoded[ClaimNames.expiration] * 1000 - Date.now() - REFRESH_WATERMARK;

        const updateToken = async () => {
          try {
            await refreshToken();
            loginUser();
          } catch (e) {
            console.error('Problem refreshing token');
          }
        };

        setTimeout(() => {
          updateToken();
        }, refreshTimeout);
      }
    } else {
      set(currentUserState, {
        token: null,
        sessionExpired: false,
      });
    }
  });

  const updateUserSettings = useRecoilCallback(
    ({ set }: CallbackInterface) => async (settings: Partial<UserSettingsPayload>) => {
      set(userSettingsState, (currentSettings) => {
        const newSettings = {
          ...currentSettings,
        };
        for (const key in settings) {
          if (newSettings[key] != null) {
            if (typeof newSettings[key] === 'object') {
              newSettings[key] = { ...newSettings[key], ...settings[key] };
            } else {
              newSettings[key] = settings[key];
            }
          }
        }
        return newSettings;
      });
    }
  );

  const setUserToken = useRecoilCallback(({ set }: CallbackInterface) => (user: Partial<CurrentUser> = {}) => {
    set(currentUserState, () => ({
      ...user,
      token: user.token || null,
      sessionExpired: false,
    }));
  });

  const setUserSessionExpired = useRecoilCallback(({ set }: CallbackInterface) => (expired: boolean) => {
    set(currentUserState, (currentUser: CurrentUser) => ({
      ...currentUser,
      sessionExpired: !!expired,
    }));
  });

  return {
    loginUser,
    updateUserSettings,
    setUserToken,
    setUserSessionExpired,
  };
};
