/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { UserSettings } from '@bfc/shared';
import jwtDecode from 'jwt-decode';
import merge from 'lodash/merge';

import { userSettingsState, currentUserState, CurrentUser } from '../atoms/appState';
import { isElectron } from '../../utils/electronUtil';
import storage from '../../utils/storage';
import { getUserTokenFromCache, loginPopup, refreshToken } from '../../utils/auth';

enum ClaimNames {
  upn = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  name = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  expiration = 'exp',
}

const REFRESH_WATERMARK = 1000 * 60 * 5; // 5 minutes

export const userDispatcher = () => {
  const loginUser = useRecoilCallback<[], Promise<void>>(({ set }: CallbackInterface) => async () => {
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

  const updateUserSettings = useRecoilCallback<[Partial<UserSettings>], void>(
    ({ set }: CallbackInterface) => (settings: Partial<UserSettings>) => {
      set(userSettingsState, (currentSettings) => {
        const newSettings = merge(currentSettings, settings);
        if (isElectron()) {
          // push updated settings to electron main process
          window.ipcRenderer.send('update-user-settings', newSettings);
        }
        storage.set('userSettings', newSettings);
        return newSettings;
      });
    }
  );

  const setUserToken = useRecoilCallback<[Partial<CurrentUser>], void>(({ set }: CallbackInterface) => (user = {}) => {
    set(currentUserState, () => ({
      ...user,
      token: user.token || null,
      sessionExpired: false,
    }));
  });

  const setUserSessionExpired = useRecoilCallback<[boolean], void>(({ set }: CallbackInterface) => (expired) => {
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
