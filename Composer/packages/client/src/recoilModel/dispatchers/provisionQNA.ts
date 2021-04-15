// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';
import { SearchManagementClient } from '@azure/arm-search';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';

import {
  getCompletedQNANotificationCardProps,
  getPendingQNANotificationCardProps,
} from '../../pages/publish/Notifications';
import settingStorage from '../../utils/dialogSettingStorage';
import { dispatcherState, settingsState } from '../atoms';

import { setError } from './shared';
import httpClient from './../../utils/httpUtil';
import { createNotification, addNotificationInternal, deleteNotificationInternal } from './notification';
// poll for the endpoint key til it is available
const fetchEndpointKey = async (projectId: string, subscriptionKey: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    httpClient
      .post(`/projects/${projectId}/qnaSettings/set`, {
        projectId,
        subscriptionKey,
      })
      .then((response) => {
        if (response.status === 200) {
          resolve(response.data);
        } else if (response.status === 202) {
          setTimeout(() => {
            fetchEndpointKey(projectId, subscriptionKey).then(resolve);
          }, 3000);
        } else {
          reject(response.data);
        }
      });
  });
};

export const provisionQNADispatcher = () => {
  const createQNA = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      tokenCredentials: TokenCredentials,
      subscriptionId: string,
      resourceGroupName: string,
      resourceName: string,
      region: string
    ) => {
      const { snapshot } = callbackHelpers;

      const startTime = new Date().getTime();

      const notification = createNotification(getPendingQNANotificationCardProps());
      // add that notification
      addNotificationInternal(callbackHelpers, notification);

      try {
        const qnaMakerSearchName = `${resourceName}-search`.toLowerCase().replace('_', '');
        const qnaMakerWebAppName = `${resourceName}-qnahost`.toLowerCase().replace('_', '');
        const qnaMakerServiceName = `${resourceName}-qna`;

        const searchManagementClient = new SearchManagementClient(tokenCredentials as any, subscriptionId);
        await searchManagementClient.services.createOrUpdate(resourceGroupName, qnaMakerSearchName, {
          location: region,
          sku: {
            name: 'standard',
          },
          replicaCount: 1,
          partitionCount: 1,
          hostingMode: 'default',
        });

        const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);
        await webSiteManagementClient.appServicePlans.createOrUpdate(resourceGroupName, resourceGroupName, {
          location: region,
          sku: {
            name: 'S1',
            tier: 'Standard',
            size: 'S1',
            family: 'S',
            capacity: 1,
          },
        });
        // deploy or update exisiting app insights component
        const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
          tokenCredentials,
          subscriptionId
        );
        await applicationInsightsManagementClient.components.createOrUpdate(resourceGroupName, resourceGroupName, {
          location: region,
          applicationType: 'web',
          kind: 'web',
        });

        // add web config for websites
        const azureSearchAdminKey = (await searchManagementClient.adminKeys.get(resourceGroupName, qnaMakerSearchName))
          .primaryKey;
        const appInsightsComponent = await applicationInsightsManagementClient.components.get(
          resourceGroupName,
          resourceGroupName
        );
        const userAppInsightsKey = appInsightsComponent.instrumentationKey;
        const userAppInsightsName = resourceGroupName;
        const userAppInsightsAppId = appInsightsComponent.appId;
        const primaryEndpointKey = `${qnaMakerWebAppName}-PrimaryEndpointKey`;
        const secondaryEndpointKey = `${qnaMakerWebAppName}-SecondaryEndpointKey`;
        const defaultAnswer = 'No good match found in KB.';
        const QNAMAKER_EXTENSION_VERSION = 'latest';

        // deploy qna host webapp
        const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(
          resourceGroupName,
          qnaMakerWebAppName,
          {
            name: qnaMakerWebAppName,
            serverFarmId: resourceGroupName,
            location: region,
            siteConfig: {
              cors: {
                allowedOrigins: ['*'],
              },
              appSettings: [
                {
                  name: 'AzureSearchName',
                  value: qnaMakerSearchName,
                },
                {
                  name: 'AzureSearchAdminKey',
                  value: azureSearchAdminKey,
                },
                {
                  name: 'UserAppInsightsKey',
                  value: userAppInsightsKey,
                },
                {
                  name: 'UserAppInsightsName',
                  value: userAppInsightsName,
                },
                {
                  name: 'UserAppInsightsAppId',
                  value: userAppInsightsAppId,
                },
                {
                  name: 'PrimaryEndpointKey',
                  value: primaryEndpointKey,
                },
                {
                  name: 'SecondaryEndpointKey',
                  value: secondaryEndpointKey,
                },
                {
                  name: 'DefaultAnswer',
                  value: defaultAnswer,
                },
                {
                  name: 'QNAMAKER_EXTENSION_VERSION',
                  value: QNAMAKER_EXTENSION_VERSION,
                },
              ],
            },
            enabled: true,
          }
        );

        // Create qna account
        const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
          tokenCredentials,
          subscriptionId
        );
        await cognitiveServicesManagementClient.accounts.create(resourceGroupName, qnaMakerServiceName, {
          kind: 'QnAMaker',
          sku: {
            name: 'F0',
          },
          location: region,
          properties: {
            apiProperties: {
              qnaRuntimeEndpoint: `https://${webAppResult.hostNames?.[0]}`,
            },
          },
        });

        const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroupName, qnaMakerServiceName);
        if (!keys?.key1) {
          throw new Error('No key found for newly created authoring resource');
        } else {
          const endpointKey = await fetchEndpointKey(projectId, keys.key1);

          const dispatcher = await snapshot.getPromise(dispatcherState);
          const currentSettings = await snapshot.getPromise(settingsState(projectId));

          dispatcher.setSettings(projectId, {
            ...currentSettings,
            qna: {
              ...currentSettings.qna,
              subscriptionKey: keys.key1,
              endpointKey: endpointKey,
            },
          });
          settingStorage.setField(projectId, 'qna.endpointKey', endpointKey);

          deleteNotificationInternal(callbackHelpers, notification.id);
          const timeElapsed = Math.floor((new Date().getTime() - startTime) / (60 * 1000));
          const completedNotification = createNotification(getCompletedQNANotificationCardProps({ time: timeElapsed }));
          addNotificationInternal(callbackHelpers, completedNotification);
        }
      } catch (error) {
        if (notification) deleteNotificationInternal(callbackHelpers, notification.id);
        setError(callbackHelpers, error);
      }
    }
  );

  return { createQNA };
};
