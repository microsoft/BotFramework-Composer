// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

import { getProvisionServices } from './provisionService';
import { appRegistrationDefinition } from './azureResources/appRegistration';
import { webAppResourceDefinition } from './azureResources/webApp';
import { azureFunctionsDefinition } from './azureResources/azureFunction';
import { botRegistrationDefinition } from './azureResources/botChannel';
import { luisAuthoringDefinition } from './azureResources/luisAuthoring';
import { appInsightsDefinition } from './azureResources/appInsights';
import { cosmosDbDefinition } from './azureResources/cosmosDb';
import { luisPredictionDefinition } from './azureResources/luisPrediction';
import { blobStorageDefinition } from './azureResources/blobStorage';
import { qnaDefinition } from './azureResources/qna';
import { servicePlanDefinition } from './azureResources/servicePlan';
import { GetResourcesResult, ResourceDefinition, ResourceProvisionService } from './types';

export const AZURE_HOSTING_GROUP_NAME = 'App Services';
export const COGNITIVE_SERVICES_GROUP_NAME = 'Cognitive Services';
// export type HostingGroupName = 'Azure Hosting' | 'Cognitive Services';

const availableResources: ResourceDefinition[] = [
  appRegistrationDefinition,
  webAppResourceDefinition,
  botRegistrationDefinition,
  azureFunctionsDefinition,
  cosmosDbDefinition,
  appInsightsDefinition,
  luisAuthoringDefinition,
  luisPredictionDefinition,
  blobStorageDefinition,
  qnaDefinition,
  servicePlanDefinition,
];

export const getResources = (project: IBotProject): GetResourcesResult[] => {
  const provisionServices: Record<string, ResourceProvisionService> = getProvisionServices();

  return availableResources.map((availableResource) => {
    const service = provisionServices[availableResource.key];
    if (service.getRecommendationForProject(project) !== 'notAllowed') {
      return {
        ...availableResource,
        required: service.getRecommendationForProject(project) === 'required',
      };
    }
  });
};
