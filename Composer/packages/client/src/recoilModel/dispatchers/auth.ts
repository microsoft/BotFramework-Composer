/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import { AzureTenant } from '@botframework-composer/types';

import {
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
} from '../atoms/appState';
import { AuthClient } from '../../utils/authClient';
import storage from '../../utils/storage';

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

      // get arm token for tenant
      try {
        console.log('GET ARM TOKEN FOR TENANT');
        const token = await AuthClient.getARMTokenForTenant(tenant);
        if (token) {
          setPrimaryToken(token);
          // fire notification

          if (notify !== false) {
            // set notification
            const notification = createNotification({
              title: formatMessage('Azure sign-in'),
              description: formatMessage("You've successfully signed in."),
              type: 'pending',
            });
            addNotificationInternal(callbackHelpers, notification);
          }
        }
      } catch (err) {
        // TODO: properly display error
        alert(err);
      }
    }
  );

  const setAvailableTenants = useRecoilCallback((callbackHelpers: CallbackInterface) => (tenants: AzureTenant[]) => {
    callbackHelpers.set(availableTenantsState, tenants);
  });

  const setShowTenantDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => (show: boolean) => {
    callbackHelpers.set(showTenantDialogState, show);
  });

  const refreshLoginStatus = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    setPrimaryToken(getTokenFromCache('accessToken'));
    setGraphToken(getTokenFromCache('graphToken'));
  });

  const requireUserLogin = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    if (userShouldProvideTokens()) {
      if (isShowAuthDialog(false)) {
        setShowAuthDialog(true);
      } else {
        // update app state with token from cache
        setPrimaryToken(getTokenFromCache('accessToken'));
        setGraphToken(getTokenFromCache('graphToken'));
      }
    } else {
      const tenantId = getTenantIdFromCache();
      try {
        console.log('GET TENANTS');
        const tenants = await AuthClient.getTenants();
        setAvailableTenants(tenants);
      } catch (err) {
        // TODO: display tenant error
        alert(err);
      }
      if (tenantId) {
        setCurrentTenant(tenantId, false);
      } else {
        setShowTenantDialog(true);
      }
    }
  });

  return {
    setShowAuthDialog,
    requireUserLogin,
    setGraphToken,
    setPrimaryToken,
    setShowTenantDialog,
    setCurrentTenant,
    refreshLoginStatus,
  };
};
