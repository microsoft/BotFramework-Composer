// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import debug from 'debug';
import React from 'react';

import { ResourcesItem, AzureAPIStatus, PreviewResourcesItem } from '../types';
import { AzureResourceTypes } from '../constants';
import * as Images from '../images';
const logger = debug('composer:extension:azureProvision');

export const useResourcesApi = () => {
  const getResourceList = React.useCallback(async (projectId: string, type: string): Promise<ResourcesItem[]> => {
    try {
      const result = await axios.get(`/api/provision/${projectId}/${type}/resources`);
      return result.data as ResourcesItem[];
    } catch (error) {
      logger({
        status: AzureAPIStatus.ERROR,
        message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    }
  }, []);

  const getPreview = React.useCallback((hostname: string): PreviewResourcesItem[] => {
    const azureWebAppName = `${hostname}`;
    const azureServicePlanName = `${hostname}`;
    const botServiceName = `${hostname}`;
    const cosmosDbName = hostname.replace(/_/g, '').substr(0, 31).toLowerCase();
    const blobStorageName = hostname.toLowerCase().replace(/-/g, '').replace(/_/g, '');
    const luisResourceName = `${hostname}-luis`;
    const luisAuthoringName = `${hostname}-luis-authoring`;
    const qnaAccountName = `${hostname}-qna`;
    const applicationInsightsName = `${hostname}`;

    const previewList = [
      {
        name: azureWebAppName,
        icon: Images.AppService,
        key: AzureResourceTypes.WEBAPP,
      },
      {
        name: azureWebAppName,
        icon: Images.AppRegistration,
        key: AzureResourceTypes.APP_REGISTRATION,
      },
      {
        name: botServiceName,
        icon: Images.BotServices,
        key: AzureResourceTypes.BOT_REGISTRATION,
      },
      {
        name: azureWebAppName,
        icon: Images.FunctionApp,
        key: AzureResourceTypes.AZUREFUNCTIONS,
      },
      {
        name: cosmosDbName,
        icon: Images.AzureCosmosDb,
        key: AzureResourceTypes.COSMOSDB,
      },
      {
        name: blobStorageName,
        icon: Images.BlobStorage,
        key: AzureResourceTypes.BLOBSTORAGE,
      },
      {
        name: applicationInsightsName,
        icon: Images.AppInsights,
        key: AzureResourceTypes.APPINSIGHTS,
      },
      {
        name: luisAuthoringName,
        icon: Images.CognitiveServices,
        key: AzureResourceTypes.LUIS_AUTHORING,
      },
      {
        name: luisResourceName,
        icon: Images.CognitiveServices,
        key: AzureResourceTypes.LUIS_PREDICTION,
      },
      {
        name: qnaAccountName,
        icon: Images.QNAMaker,
        key: AzureResourceTypes.QNA,
      },
      {
        name: azureServicePlanName,
        icon: Images.AppServicePlan,
        key: AzureResourceTypes.SERVICE_PLAN,
      },
    ];

    return previewList;
  }, []);

  const getExistingResources = React.useCallback((config) => {
    const result = [];
    if (config) {
      // If name or hostname is configured, it means the webapp is already created.
      if (config.hostname || config.name) {
        result.push(AzureResourceTypes.WEBAPP);
        result.push(AzureResourceTypes.AZUREFUNCTIONS);
      }
      if (config.settings?.MicrosoftAppId) {
        result.push(AzureResourceTypes.BOT_REGISTRATION);
        result.push(AzureResourceTypes.APP_REGISTRATION);
      }
      if (config.settings?.luis?.authoringKey) {
        result.push(AzureResourceTypes.LUIS_AUTHORING);
      }
      if (config.settings?.luis?.endpointKey) {
        result.push(AzureResourceTypes.LUIS_PREDICTION);
      }
      if (config.settings?.qna?.subscriptionKey) {
        result.push(AzureResourceTypes.QNA);
      }
      if (config.settings?.applicationInsights?.InstrumentationKey) {
        result.push(AzureResourceTypes.APPINSIGHTS);
      }
      if (config.settings?.cosmosDb?.authKey) {
        result.push(AzureResourceTypes.COSMOSDB);
      }
      if (config.settings?.blobStorage?.connectionString) {
        result.push(AzureResourceTypes.BLOBSTORAGE);
      }
    }
    return result;
  }, []);

  return { getResourceList, getPreview, getExistingResources };
};
