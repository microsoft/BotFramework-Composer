// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import formatMessage from 'format-message';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { provisionConfigState, provisionStatusState, settingsState } from '../atoms/botState';
import { getAccessTokenInCache, getGraphTokenInCache } from '../../utils/auth';
import { CardProps } from '../../components/NotificationCard';

import { addNotificationInternal, createNotifiction, updateNotificationInternal } from './notification';
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
        const notification = createNotifiction(getProvisionPendingNotification(result.data.message));
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
        if (response.data.config && response.data.config != {}) {
          clearInterval(timer);
          // update publishConfig
          callbackHelpers.set(settingsState(projectId), (settings) => {
            settings.publishTargets = settings.publishTargets?.map((item) => {
              if (item.name === targetName) {
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

          // set notification into success
          // const newNotification = createNotifiction(getProvisionSuccessNotification(response.data.message));
          // updateNotification(callbackHelpers, notificationId, newNotification);
          // notificationId = newNotification.id;

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
          // set notification into success
          // const newNotification = createNotifiction(getProvisionPendingNotification(response.data.message));
          // // update notification
          // updateNotification(callbackHelpers, notificationId, newNotification);
          // notificationId = newNotification.id;
          updateNotificationInternal(
            callbackHelpers,
            notificationId,
            getProvisionPendingNotification(response.data.message)
          );

          // update provision status
          const statObj = await callbackHelpers.snapshot.getPromise(provisionStatusState(projectId));
          const stat = statObj[targetName];
          console.log(stat);
          const newStat = { ...stat, ...response.data, notificationId };
          console.log(newStat);
          // update provision status
          callbackHelpers.set(provisionStatusState(projectId), (status) => ({
            ...status,
            [targetName]: newStat,
          }));
        }
      } catch (err) {
        console.log(err.response.data);
        // update notification
        // const newNotification = createNotifiction(
        //   getProvisionFailureNotification(err.response.data?.message || 'Error')
        // );
        // updateNotification(callbackHelpers, notificationId, newNotification);
        // notificationId = newNotification.id;

        updateNotificationInternal(
          callbackHelpers,
          notificationId,
          getProvisionFailureNotification(err.response.data?.message || 'Error')
        );
        const newStat = { ...err.response.data, notificationId };
        console.log(newStat);
        // update provision status
        callbackHelpers.set(provisionStatusState(projectId), (status) => ({
          ...status,
          [targetName]: newStat,
        }));
        clearInterval(timer);
      }
    }, 2000);
  };

  const setProvisionConfig = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (config: any, projectId: string) => {
      const { set } = callbackHelpers;
      set(provisionConfigState(projectId), (configs) => ({
        ...configs,
        [config.name]: config,
      }));
    }
  );

  // const getProvisionStatus = useRecoilCallback(
  //   (callbackHelpers: CallbackInterface) => async (projectId: string, targetName: string, targetType: string) => {
  //     //get jobId by targetName
  //     const provisionStatus = await callbackHelpers.snapshot.getPromise(provisionStatusState(projectId));
  //     const jobId = provisionStatus[targetName]?.id;
  //     console.log(jobId);
  //     try {
  //       const response = await httpClient.get(`/provision/${projectId}/status/${targetType}/${targetName}/${jobId}`);
  //       if (response.data.config && response.data.config != {}) {
  //         // update publishConfig
  //         callbackHelpers.set(settingsState(projectId), (settings) => {
  //           settings.publishTargets = settings.publishTargets?.map((item) => {
  //             if (item.name === targetName) {
  //               return {
  //                 ...item,
  //                 configuration: JSON.stringify(response.data.config, null, 2),
  //               };
  //             } else {
  //               return item;
  //             }
  //           });
  //           return settings;
  //         });

  //         const status = provisionStatus[targetName];
  //         // set notification into success
  //         const newNotification = createNotifiction(getProvisionPendingNotification(response.data.message));
  //         updateNotification(callbackHelpers, status.notificationId, newNotification);

  //         // delete provisionStatus
  //         callbackHelpers.set(provisionStatusState(projectId), (status) => {
  //           delete status[targetName];
  //           return status;
  //         });
  //       } else {
  //         const stat = provisionStatus[targetName];
  //         console.log(stat);
  //         // update notification
  //         // set notification into success
  //         const newNotification = createNotifiction(getProvisionSuccessNotification(response.data.message));
  //         updateNotification(callbackHelpers, stat.notificationId, newNotification);

  //         const newStat = { ...stat, ...response.data, notificationId: newNotification.id };
  //         console.log(newStat);
  //         // update provision status
  //         callbackHelpers.set(provisionStatusState(projectId), (status) => ({
  //           ...status,
  //           [targetName]: newStat,
  //         }));
  //       }
  //     } catch (err) {
  //       console.log(err.response);

  //       // update notification
  //       const newNotification = createNotifiction(
  //         getProvisionFailureNotification(err.response.data?.message || 'Error')
  //       );
  //       const status = provisionStatus[targetName];
  //       updateNotification(callbackHelpers, status.notificationId, newNotification);
  //       const newStat = { ...err.response.data, notificationId: newNotification.id };
  //       console.log(newStat);
  //       // update provision status
  //       callbackHelpers.set(provisionStatusState(projectId), (status) => ({
  //         ...status,
  //         [targetName]: newStat,
  //       }));
  //     }
  //   }
  // );

  return {
    // getProvisionStatus,
    provisionToTarget,
    setProvisionConfig,
  };
};
