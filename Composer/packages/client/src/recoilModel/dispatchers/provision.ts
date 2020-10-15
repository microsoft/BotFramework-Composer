// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { settingsState } from '../atoms/botState';
import { getAccessTokenInCache, getGraphTokenInCache } from '../../utils/auth';
import { CardProps } from '../../components/NotificationCard';

import { addNotificationInternal, createNotifiction } from './notification';
import httpClient from './../../utils/httpUtil';

export const provisionDispatcher = () => {
  const getProvisionPendingNotification = (value: string): CardProps => {
    return {
      title: formatMessage('Provisioning ...'),
      description: formatMessage('{msg}', { msg: value }),
      type: 'pending',
    };
  };
  const provisionToTarget = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (config: any, type: string, projectId: string) => {
      try {
        const token = getAccessTokenInCache();
        const result = await httpClient.post(
          `/provision/${projectId}/${type}`,
          { ...config, accessToken: token, graphToken: getGraphTokenInCache() },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(result.data);
        // set(settingsState(projectId), (settings) => ({
        //   ...settings,
        //   provisionConfig: result.data,
        // }));
        const notification = createNotifiction(getProvisionPendingNotification(result.data.message));
        addNotificationInternal(callbackHelpers, notification);
      } catch (error) {
        console.log(error.response.data);
      }
    }
  );

  const getProvisionStatus = useRecoilCallback(
    ({ set }: CallbackInterface) => async (projectId: string, target: any) => {
      const timer = setInterval(async () => {
        try {
          const response = await httpClient.get(`/provision/${projectId}/status/${target.name}`);
          if (response.data.config && response.data.config != {}) {
            clearInterval(timer);
            // update publishConfig
            set(settingsState(projectId), (settings) => {
              settings.publishTargets = settings.publishTargets?.map((item) => {
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
              return settings;
            });
          } else {
            // update provision status
            set(settingsState(projectId), (settings) => {
              settings.publishTargets = settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    provisionStatus: JSON.stringify(response.data.details, null, 2),
                  };
                } else {
                  return item;
                }
              });
              return settings;
            });
          }
        } catch (err) {
          console.log(err.response);
          // remove that publishTarget
          set(settingsState(projectId), (settings) => {
            settings.publishTargets = settings.publishTargets?.filter((item) => item.name !== target.name);
            return settings;
          });
          clearInterval(timer);
        }
      }, 10000);
    }
  );

  return {
    getProvisionStatus,
    provisionToTarget,
  };
};
