// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import {
  subscriptionsState,
  resourceGroupsState,
  resourcesState,
  deployLocationsState,
  settingsState,
} from '../atoms/botState';
import { getAccessTokenInCache, loginPopup, getGraphTokenInCache } from '../../utils/auth';
import httpClient from './../../utils/httpUtil';

export const provisionDispatcher = () => {
  const getSubscriptions = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    try {
      const token = getAccessTokenInCache();
      console.log(token);
      const result = await httpClient.get('/publish/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(result.data);
      set(subscriptionsState, (subscriptions: any) => {
        result.data.value?.map((item) => {
          subscriptions.push({
            subscriptionId: item.subscriptionId,
            tenantId: item.tenantId,
            displayName: item.displayName,
          });
        });
        return subscriptions;
      });
    } catch (error) {
      console.log(error.response.data);
      // popup window to login
      if (error.response.data.redirectUri) {
        await loginPopup(error.response.data.redirectUri);
      }
      // save token in localStorage
    }
  });

  const getResourceGroups = useRecoilCallback(({ set }: CallbackInterface) => async (subscriptionId: string) => {
    try {
      const token = getAccessTokenInCache();
      console.log(token);
      const result = await httpClient.get(`/publish/resourceGroups/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(result.data);
      set(resourceGroupsState, result.data.value);
    } catch (error) {
      console.log(error.response.data);
      // popup window to login
      if (error.response.data.redirectUri) {
        await loginPopup(error.response.data.redirectUri, 'https://dev.botframework.com/cb');
      }
    }
  });

  // get resources by resource group
  const getResources = useRecoilCallback(
    ({ set }: CallbackInterface) => async (subscriptionId: string, resourceGroup: string) => {
      try {
        const token = getAccessTokenInCache();
        console.log(token);
        const result = await httpClient.get(`/publish/resources/${subscriptionId}/${resourceGroup}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(result.data);
        set(resourcesState, result.data.value);
      } catch (error) {
        console.log(error.response.data);
        // popup window to login
        if (error.response.data.redirectUri) {
          await loginPopup(error.response.data.redirectUri, 'https://dev.botframework.com/cb');
        }
      }
    }
  );

  const getDeployLocations = useRecoilCallback(({ set }: CallbackInterface) => async (subscriptionId: string) => {
    try {
      const token = getAccessTokenInCache();
      console.log(token);
      const result = await httpClient.get(`/publish/${subscriptionId}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(result.data);
      set(deployLocationsState, result.data.value);
    } catch (error) {
      console.log(error.response.data);
      // popup window to login
      if (error.response.data.redirectUri) {
        await loginPopup(error.response.data.redirectUri, 'https://dev.botframework.com/cb');
      }
    }
  });

  const provisionToTarget = useRecoilCallback(
    ({ set }: CallbackInterface) => async (config: any, type: string, projectId: string) => {
      try {
        const token = getAccessTokenInCache();
        const result = await httpClient.post(
          `/publish/${projectId}/provision/${type}`,
          { ...config, graphToken: getGraphTokenInCache() },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(result.data);
        set(settingsState, (settings) => ({
          ...settings,
          provisionConfig: result.data,
        }));
      } catch (error) {
        console.log(error.response.data);
      }
    }
  );

  const getProvisionStatus = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, target: any) => {
      let timer;

      timer = setInterval(async () => {
        try {
          const response = await httpClient.get(`/publish/${projectId}/provisionStatus/${target.name}`);
          console.log(response.data);
          if (response.data.config && response.data.config != {}) {
            clearInterval(timer);
            // update publishConfig
            set(settingsState, (settings) => {
              return settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    configuration: JSON.stringify(response.data.config, null, 2),
                    provisionStatus: JSON.stringify(response.data.details, null, 2),
                  };
                } else {
                  return item;
                }
              });
            });
          } else {
            // update provision status
            set(settingsState, (settings) => {
              return settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    provisionStatus: JSON.stringify(response.data.details, null, 2),
                  };
                } else {
                  return item;
                }
              });
            });
          }
        } catch (err) {
          console.log(err.response.data);
          // remove that publishTarget
          set(settingsState, (settings) => {
            return settings.publishTargets?.filter((item) => item.name !== target.name);
          });
          clearInterval(timer);
        }
      }, 10000);
    }
  );

  return {
    getSubscriptions,
    getResources,
    getResourceGroups,
    getDeployLocations,
    getProvisionStatus,
  };
};
