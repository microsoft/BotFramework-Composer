// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import { DialogSetting, PublishTarget } from '@bfc/shared';

import { provisionStatusState, settingsState } from '../atoms/botState';
import { CardProps } from '../../components/Notifications/NotificationCard';
import TelemetryClient from '../../telemetry/TelemetryClient';

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

  const updatePublishTargets = (settings: DialogSetting, profile: PublishTarget) => {
    const index = settings.publishTargets?.findIndex((item) => item.name === profile.name);
    if (typeof index === 'number' && index >= 0) {
      return settings.publishTargets?.map((item) => {
        if (item.name === profile.name) {
          return profile;
        } else {
          return item;
        }
      });
    } else {
      return (settings.publishTargets || []).concat([profile]);
    }
  };

  const provisionToTarget = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      config: any,
      type: string,
      projectId: string,
      armToken = '',
      graphToken = '',
      currentProfile: PublishTarget | undefined = undefined
    ) => {
      try {
        TelemetryClient.track('NewPublishingProfileStarted');
        const result = await httpClient.post(
          `/provision/${projectId}/${type}`,
          { ...config, graphToken: graphToken, currentProfile },
          {
            headers: { Authorization: `Bearer ${armToken}` },
          }
        );
        // set notification
        const notification = createNotification(getProvisionPendingNotification(result.data.message));
        addNotificationInternal(callbackHelpers, notification);
        // initialize this profile's provision status state
        callbackHelpers.set(provisionStatusState(projectId), (provisionStatus) => {
          const newStat = {
            ...provisionStatus,
            [result.data.processName]: {
              ...result.data,
              notificationId: notification.id,
            },
          };
          return newStat;
        });

        // call provision status api interval to update the state.
        updateProvisionStatus(
          callbackHelpers,
          result.data.id,
          projectId,
          result.data.processName,
          type,
          notification.id
        );
      } catch (error) {
        // set notification
        const notification = createNotification(
          getProvisionFailureNotification(error.response?.data || 'Error when provision target')
        );
        addNotificationInternal(callbackHelpers, notification);
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
      let notification,
        isCleanTimer = false;
      try {
        const response = await httpClient.get(`/provision/${projectId}/status/${targetType}/${targetName}/${jobId}`);
        if (response.data?.status === 200 && response.data.config && response.data.config != {}) {
          // delete provisionStatus
          callbackHelpers.set(provisionStatusState(projectId), (status) => {
            const newStatus = { ...status };
            delete newStatus[targetName];
            return newStatus;
          });

          // update publishTargets
          callbackHelpers.set(settingsState(projectId), (settings) => {
            const profile = {
              configuration: JSON.stringify(response.data.config, null, 2),
              name: targetName,
              type: targetType,
            };
            const targetList = updatePublishTargets(settings, profile);
            console.log(targetList);
            return {
              ...settings,
              publishTargets: targetList,
            };
          });

          TelemetryClient.track('NewPublishingProfileSaved', { type: targetType });

          notification = getProvisionSuccessNotification(response.data.message);
          isCleanTimer = true;
        } else {
          if (response.data.status !== 500) {
            notification = getProvisionPendingNotification(response.data.message);
          } else {
            notification = getProvisionFailureNotification(response.data.message);
            isCleanTimer = true;
          }

          // update provision status
          const statObj = await callbackHelpers.snapshot.getPromise(provisionStatusState(projectId));
          const stat = statObj[targetName];
          const newStat = { ...stat, ...response.data, notificationId };
          callbackHelpers.set(provisionStatusState(projectId), (status) => ({
            ...status,
            [targetName]: newStat,
          }));
        }
      } catch (err) {
        // update notification
        notification = getProvisionFailureNotification(err.response?.data?.message || 'Error');
        const newStat = { ...err.response?.data, notificationId };
        // update provision status
        callbackHelpers.set(provisionStatusState(projectId), (status) => ({
          ...status,
          [targetName]: newStat,
        }));
        isCleanTimer = true;
      } finally {
        if (isCleanTimer) {
          clearInterval(timer);
        }
        // update notification
        updateNotificationInternal(callbackHelpers, notificationId, notification);
      }
    }, 5000);
  };

  return {
    provisionToTarget,
  };
};
