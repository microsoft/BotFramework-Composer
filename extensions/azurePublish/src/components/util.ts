// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import jwtDecode from 'jwt-decode';

import { AzureResourceTypes } from '../types';

export const decodeToken = (token: string) => {
  try {
    return jwtDecode<any>(token);
  } catch (err) {
    console.error('decode token error in ', err);
    return null;
  }
};

export const removePlaceholder = (config: any) => {
  try {
    if (config) {
      let str = JSON.stringify(config);
      str = str.replace(/<[^>]*>/g, '');
      const newConfig = JSON.parse(str);
      return newConfig;
    } else {
      return undefined;
    }
  } catch (e) {
    console.error(e);
  }
};

export const getExistResources = (config) => {
  const result = [];
  if (config) {
    // If name or hostname is configured, it means the webapp is already created.
    if (config.hostname || config.name) {
      result.push(AzureResourceTypes.WEBAPP);
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
    return result;
  } else return [];
};

export const defaultExtensionState = {
  subscriptionId: '',
  resourceGroup: '',
  hostName: '',
  location: '',
  luisLocation: '',
  enabledResources: [],
  requiredResources: [],
  choice: { key: 'create', text: 'Create new Azure resources' },
};
