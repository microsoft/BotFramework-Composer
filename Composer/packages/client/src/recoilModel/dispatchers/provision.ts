// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { provisionStatusState, settingsState } from '../atoms/botState';
import { getAccessTokenInCache, getGraphTokenInCache } from '../../utils/auth';
import { CardProps } from '../../components/NotificationCard';

import { addNotificationInternal, createNotifiction, deleteNotificationInternal } from './notification';
import httpClient from './../../utils/httpUtil';

export const provisionDispatcher = () => {
  const getProvisionPendingNotification = (value: string): CardProps => {
    return {
      title: formatMessage('Provisioning ...'),
      description: formatMessage('{msg}', { msg: value }),
      type: 'pending',
    };
  };
  const getProvisionSuccessNotification = (value: string): CardProps => {
    return {
      title: formatMessage('Provision success'),
      description: formatMessage('{msg}', { msg: value }),
      type: 'success',
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
        const notification = createNotifiction(getProvisionPendingNotification(result.data.message));
        addNotificationInternal(callbackHelpers, notification);
        // update provision status
        callbackHelpers.set(provisionStatusState(projectId), (provisionStatus) => ({
          ...provisionStatus,
          [result.data.processName]: {
            ...result.data,
            notificationId: notification.id,
          },
        }));
      } catch (error) {
        console.log(error.response.data);
      }
    }
  );

  const getProvisionStatus = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string, target: any) => {
      const timer = setInterval(async () => {
        try {
          const response = await httpClient.get(`/provision/${projectId}/status/${target.name}`);
          if (response.data.config && response.data.config != {}) {
            clearInterval(timer);
            // update publishConfig
            callbackHelpers.set(settingsState(projectId), (settings) => {
              settings.publishTargets = settings.publishTargets?.map((item) => {
                if (item.name === target.name) {
                  return {
                    ...item,
                    configuration: JSON.stringify(response.data.config, null, 2),
                  };
                } else {
                  return item;
                }
              });
              return settings;
            });

            // get provision status
            const provisionStatus = await callbackHelpers.snapshot.getPromise(provisionStatusState(projectId));
            // delete previous status for the provision
            const status = provisionStatus[target.name];
            deleteNotificationInternal(callbackHelpers, status.notificationId);
            // set notification into success
            const newNotification = createNotifiction(getProvisionSuccessNotification(response.data.message));
            addNotificationInternal(callbackHelpers, newNotification);
          } else {
            // update provision status
            callbackHelpers.set(provisionStatusState(projectId), (status) => ({
              ...status,
              [target.name]: response.data,
            }));
            // update notification
          }
        } catch (err) {
          console.log(err.response);
          // remove that publishTarget
          callbackHelpers.set(settingsState(projectId), (settings) => {
            settings.publishTargets = settings.publishTargets?.filter((item) => item.name !== target.name);
            return settings;
          });
          // update notification

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
