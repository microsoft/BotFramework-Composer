// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { provisionStatusState, settingsState } from '../atoms/botState';
import { getAccessTokenInCache, getGraphTokenInCache } from '../../utils/auth';
import { CardProps } from '../../components/Notifications/NotificationCard';

import { addNotificationInternal, createNotification, updateNotificationInternal } from './notification';
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
  const getProvisionFailureNotification = (value: string): CardProps => {
    return {
      title: formatMessage('Provision failure'),
      description: formatMessage('{msg}', { msg: value }),
      type: 'error',
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
        const notification = createNotification(getProvisionPendingNotification(result.data.message));
        addNotificationInternal(callbackHelpers, notification);
        // update provision status
        callbackHelpers.set(provisionStatusState(projectId), (provisionStatus) => {
          const newStat = {
            ...provisionStatus,
            [result.data.processName]: {
              ...result.data,
              notificationId: notification.id,
            },
          };
          console.log(newStat);
          return newStat;
        });

        // get provision status
        updateProvisionStatus(
          callbackHelpers,
          result.data.id,
          projectId,
          result.data.processName,
          type,
          notification.id
        );
      } catch (error) {
        console.log(error.response.data);
      }
    }
  );

  // update provision status interval
  const updateProvisionStatus = async (
    callbackHelpers: CallbackInterface,
    jobId: string,
    projectId: string,
    targetName: string,
    targetType: string,
    notificationId: string
  ) => {
    const timer = setInterval(async () => {
      try {
        const response = await httpClient.get(`/provision/${projectId}/status/${targetType}/${targetName}/${jobId}`);
        if (response.data?.status === 200 && response.data.config && response.data.config != {}) {
          clearInterval(timer);
          // update publishConfig
          callbackHelpers.set(settingsState(projectId), (settings) => {
            settings.publishTargets?.push({
              configuration: JSON.stringify(response.data.config, null, 2),
              name: targetName,
              type: targetType,
            });
            return settings;
          });

          // update notification
          updateNotificationInternal(
            callbackHelpers,
            notificationId,
            getProvisionSuccessNotification(response.data.message)
          );
          // delete provisionStatus
          callbackHelpers.set(provisionStatusState(projectId), (status) => {
            delete status[targetName];
            return status;
          });
        } else {
          if (response.data.status !== 500) {
            updateNotificationInternal(
              callbackHelpers,
              notificationId,
              getProvisionPendingNotification(response.data.message)
            );
          } else {
            updateNotificationInternal(
              callbackHelpers,
              notificationId,
              getProvisionFailureNotification(response.data.message)
            );
          }

          // update provision status
          const statObj = await callbackHelpers.snapshot.getPromise(provisionStatusState(projectId));
          const stat = statObj[targetName];
          const newStat = { ...stat, ...response.data, notificationId };
          // update provision status
          callbackHelpers.set(provisionStatusState(projectId), (status) => ({
            ...status,
            [targetName]: newStat,
          }));
          if (response.data.status === 500) {
            clearInterval(timer);
          }
        }
      } catch (err) {
        console.log(err.response.data);

        updateNotificationInternal(
          callbackHelpers,
          notificationId,
          getProvisionFailureNotification(err.response.data?.message || 'Error')
        );
        const newStat = { ...err.response.data, notificationId };
        // update provision status
        callbackHelpers.set(provisionStatusState(projectId), (status) => ({
          ...status,
          [targetName]: newStat,
        }));
        clearInterval(timer);
      }
    }, 5000);
  };

  return {
    provisionToTarget,
  };
};
