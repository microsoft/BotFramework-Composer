/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

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
  currentTenantIdState,
  currentUserState,
  isAuthenticatedState,
  requiresGraphState,
} from '../atoms/authState';
import { AuthClient } from '../../utils/authClient';
import storage from '../../utils/storage';
import { graphScopes } from '../../constants';

import { addNotificationInternal, createNotification } from './notification';

export type UserLoginOptions = {
  requireGraph?: boolean;
  chooseTenant?: boolean;
};

export const authDispatcher = () => {
  const setShowAuthDialog = useRecoilCallback(({ set }: CallbackInterface) => (show: boolean, graph: boolean) => {
    set(showAuthDialogState, show);
    set(requiresGraphState, graph);
  });

  const setPrimaryToken = useRecoilCallback(({ set }: CallbackInterface) => (token: string) => {
    set(primaryTokenState, token);
    storage.set('accessToken', token);
  });

  const setGraphToken = useRecoilCallback(({ set }: CallbackInterface) => (token: string) => {
    set(graphTokenState, token);
    storage.set('graphToken', token);
  });

  const setCurrentTenant = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (tenant: string, notify = true) => {
      callbackHelpers.set(currentTenantIdState, tenant);
      setTenantId(tenant);
      if (tenant) {
        // get arm token for tenant
        try {
          const token = await AuthClient.getARMTokenForTenant(tenant);
          const graph = await AuthClient.getAccessToken(graphScopes);
          const isAlreadyAuthenticated = await callbackHelpers.snapshot.getPromise(isAuthenticatedState);

          if (token) {
            setCurrentUser(token, graph);

            // fire notification
            if (notify !== false) {
              let notification;
              if (isAlreadyAuthenticated) {
                // set notification
                notification = createNotification({
                  title: formatMessage('Azure sign in'),
                  description: formatMessage("You've successfully switched directories."),
                  type: 'success',
                  retentionTime: 5000,
                });
              } else {
                // set notification
                notification = createNotification({
                  title: formatMessage('Azure sign in'),
                  description: formatMessage("You've successfully signed in."),
                  type: 'success',
                  retentionTime: 5000,
                });
              }
              addNotificationInternal(callbackHelpers, notification);
            }
          } else {
            throw new Error('Could not get fetch token.');
          }
        } catch (err) {
          console.error(`Error in auth: ${err.message || err.toString()}`);
          const notification = createNotification({
            title: formatMessage('Azure sign in'),
            description: formatMessage(`Sign in failed. Please try again.`, { message: err.message || err.toString() }),
            type: 'error',
            retentionTime: 5000,
          });
          addNotificationInternal(callbackHelpers, notification);
          // clear out app state
          resetCreds();
        }
      }
    }
  );

  const setShowTenantDialog = useRecoilCallback(({ set }: CallbackInterface) => (show: boolean) => {
    set(showTenantDialogState, show);
  });

  const setCurrentUser = useRecoilCallback(
    ({ set }: CallbackInterface) => (token: string | undefined, graph?: string) => {
      setPrimaryToken(token || '');
      setGraphToken(graph || '');

      if (token) {
        const decoded = decodeToken(token);

        set(currentUserState, {
          token: token ?? null,
          graph: graph ?? null,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        set(isAuthenticatedState, true);

        set(currentTenantIdState, decoded.tid);
        setTenantId(decoded.tid);
      } else {
        set(currentUserState, {
          token: '',
          graph: '',
          sessionExpired: true,
        });
        set(isAuthenticatedState, false);
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
    (callbackHelpers: CallbackInterface) => async (desiredTenantId?: string, options?: UserLoginOptions) => {
      if (userShouldProvideTokens()) {
        if (isShowAuthDialog(options?.requireGraph || false)) {
          setShowAuthDialog(true, options?.requireGraph || false);
        } else {
          // update app state with token from cache
          setCurrentUser(getTokenFromCache('accessToken'), getTokenFromCache('graphToken'));
        }
      } else if (desiredTenantId) {
        setCurrentTenant(desiredTenantId);
      } else {
        const cachedTenantId = getTenantIdFromCache();
        let tenantId;
        try {
          const tenants = await AuthClient.getTenants();
          callbackHelpers.set(availableTenantsState, tenants);
          if (tenants.length === 0) {
            throw new Error('No Azure Directories were found.');
          } else if (cachedTenantId && tenants.map((t) => t.tenantId).includes(cachedTenantId)) {
            tenantId = cachedTenantId;
          } else if (tenants.length === 1) {
            tenantId = tenants[0].tenantId;
          }
          if (tenantId && !options?.chooseTenant) {
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
