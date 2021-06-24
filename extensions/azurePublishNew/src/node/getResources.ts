// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

import { getProvisionServices } from './provisionService';
import { GetResourcesResult, ResourceDefinition, ResourceProvisionService } from './types';
import {
  appInsightsDefinition,
  appRegistrationDefinition,
  azureFunctionDefinition,
  blobStorageDefinition,
  botRegistrationDefinition,
  cosmosDbDefinition,
  luisAuthoringDefinition,
  luisPredictionDefinition,
  qnaDefinition,
  servicePlanDefinition,
  webAppResourceDefinition,
} from './azureResources/resourceDefinitions';

const availableResources: ResourceDefinition[] = [
  appRegistrationDefinition,
  webAppResourceDefinition,
  botRegistrationDefinition,
  azureFunctionDefinition,
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
