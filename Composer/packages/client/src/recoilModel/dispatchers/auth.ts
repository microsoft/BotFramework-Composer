/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import { AzureTenant } from '@botframework-composer/types';

import {
  decodeToken,
  userShouldProvideTokens,
  isShowAuthDialog,
  getTokenFromCache,
  setTenantId,
  getTenantIdFromCache,
} from '../../utils/auth';
import {
  showAuthDialogState,
  primaryTokenState,
  graphTokenState,
  availableTenantsState,
  showTenantDialogState,
  currentTenantState,
  currentUserState,
  isAuthenticatedState,
} from '../atoms/authState';
import { AuthClient } from '../../utils/authClient';
import storage from '../../utils/storage';
import { graphScopes } from '../../constants';

import { addNotificationInternal, createNotification } from './notification';

export const authDispatcher = () => {
  const setShowAuthDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => (show: boolean) => {
    callbackHelpers.set(showAuthDialogState, show);
  });

  const setPrimaryToken = useRecoilCallback((callbackHelpers: CallbackInterface) => (token: string) => {
    callbackHelpers.set(primaryTokenState, token);
    storage.set('accessToken', token);
  });

  const setGraphToken = useRecoilCallback((callbackHelpers: CallbackInterface) => (token: string) => {
    callbackHelpers.set(graphTokenState, token);
    storage.set('graphToken', token);
  });

  const setCurrentTenant = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (tenant: string, notify = true) => {
      callbackHelpers.set(currentTenantState, tenant);
      setTenantId(tenant);
      if (tenant) {
        // get arm token for tenant
        try {
          console.log('Get arm token for tenant', tenant);
          const token = await AuthClient.getARMTokenForTenant(tenant);
          const graph = await AuthClient.getAccessToken(graphScopes);

          if (token) {
            setCurrentUser(token, graph);

            // fire notification
            if (notify !== false) {
              // set notification
              const notification = createNotification({
                title: formatMessage('Azure sign-in'),
                description: formatMessage("You've successfully signed in."),
                type: 'info',
              });
              addNotificationInternal(callbackHelpers, notification);
            }
          }
        } catch (err) {
          const notification = createNotification({
            title: formatMessage('Azure sign-in'),
            description: formatMessage(`Sign in failed: {message}`, { message: err.message || err.toString() }),
            type: 'error',
          });
          addNotificationInternal(callbackHelpers, notification);
          // clear out app state
          resetCreds();
        }
      }
    }
  );

  const setAvailableTenants = useRecoilCallback((callbackHelpers: CallbackInterface) => (tenants: AzureTenant[]) => {
    callbackHelpers.set(availableTenantsState, tenants);
  });

  const setShowTenantDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => (show: boolean) => {
    callbackHelpers.set(showTenantDialogState, show);
  });

  const setCurrentUser = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (token: string | undefined, graph?: string) => {
      setPrimaryToken(token || '');
      setGraphToken(graph || '');

      if (token) {
        const decoded = decodeToken(token);

        callbackHelpers.set(currentUserState, {
          token,
          graph,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        callbackHelpers.set(isAuthenticatedState, true);
      } else {
        callbackHelpers.set(currentUserState, {});
        callbackHelpers.set(isAuthenticatedState, false);
      }
    }
  );

  const refreshLoginStatus = useRecoilCallback(() => async () => {
    const token = getTokenFromCache('accessToken');
    const graph = getTokenFromCache('graphToken');
    setCurrentUser(token, graph);
  });

  const resetCreds = () => {
    setCurrentUser(undefined);
    setGraphToken('');
    setCurrentTenant('');
  };

  const logoutUser = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    // clear out app state
    resetCreds();

    // call additional logout logic in auth client
    AuthClient.logOut();
  });

  const requireUserLogin = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (desiredTenantId?: string) => {
      if (userShouldProvideTokens()) {
        if (isShowAuthDialog(false)) {
          setShowAuthDialog(true);
        } else {
          // update app state with token from cache
          setCurrentUser(getTokenFromCache('accessToken'));
          setGraphToken(getTokenFromCache('graphToken'));
        }
      } else if (desiredTenantId) {
        console.log('Logging into specific tenant:', desiredTenantId);
        setCurrentTenant(desiredTenantId);
      } else {
        const cachedTenantId = getTenantIdFromCache();
        let tenantId;
        console.log('Getting list of tenants...');
        try {
          const tenants = await AuthClient.getTenants();
          setAvailableTenants(tenants);
          if (tenants.length === 0) {
            throw new Error('No Azure Directories were found.');
          } else if (cachedTenantId && tenants.map((t) => t.tenantId).includes(cachedTenantId)) {
            tenantId = cachedTenantId;
          } else if (tenants.length === 1) {
            tenantId = tenants[0].tenantId;
          }
          if (tenantId) {
            setCurrentTenant(tenantId, false);
          } else {
            setShowTenantDialog(true);
          }
        } catch (err) {
          const notification = createNotification({
            title: formatMessage('Azure sign-in'),
            description: formatMessage(`Sign in failed: {message}`, { message: err.message || err.toString() }),
            type: 'error',
          });
          addNotificationInternal(callbackHelpers, notification);
          // clean out the app state
          resetCreds();
        }
      }
    }
  );

  return {
    setShowAuthDialog,
    requireUserLogin,
    setGraphToken,
    setPrimaryToken,
    setShowTenantDialog,
    setCurrentTenant,
    setCurrentUser,
    refreshLoginStatus,
    logoutUser,
  };
};
