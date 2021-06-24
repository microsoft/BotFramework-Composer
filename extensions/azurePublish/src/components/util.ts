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
    return result;
  } else return [];
};

export const defaultExtensionState = {
  subscriptionId: '',
  resourceGroup: '',
  hostname: '',
  region: '',
  luisLocation: '',
  enabledResources: [],
  requiredResources: [],
  creationType: 'create',
};

// Note: parseRuntimeKey is cut-and-pasted from skills because importing it from @bfc/shared adds a crypto dependency that the UI doesn't have.

/**
 * Returns true if the runtime key is adaptive; false otherwise.
 * Example adaptive runtime keys: 'adaptive-runtime-dotnet-webapp' or 'adaptive-runtime-node-functions'
 * Example older adaptive runtime keys: 'csharp-azurewebapp-v2'
 */
const isUsingAdaptiveRuntimeKey = (runtimeKey?: string): boolean =>
  runtimeKey === 'csharp-azurewebapp-v2' || !!runtimeKey?.startsWith('adaptive-runtime-');

/**
 * Parses the runtime key
 * Example adaptive runtime keys: 'adaptive-runtime-dotnet-webapp' or 'adaptive-runtime-node-functions'
 * Example older adaptive runtime keys: 'csharp-azurewebapp-v2'
 * @returns If the runtime is adaptive and the parsed runtime language and type
 * @default { isUsingAdaptiveRuntime: false, runtimeLanguage: 'dotnet', runtimeType: 'webapp'}
 */
export const parseRuntimeKey = (
  runtimeKey?: string
): { isUsingAdaptiveRuntime: boolean; runtimeLanguage?: string; runtimeType?: string } => {
  const isAdaptive = isUsingAdaptiveRuntimeKey(runtimeKey);

  if (runtimeKey && isAdaptive) {
    const parts = runtimeKey?.split('-');
    if (parts.length === 4) {
      return {
        isUsingAdaptiveRuntime: isAdaptive,
        runtimeLanguage: parts[2],
        runtimeType: parts[3],
      };
    }
  }

  return {
    isUsingAdaptiveRuntime: isAdaptive,
    runtimeLanguage: 'dotnet',
    runtimeType: 'webapp',
  };
};
