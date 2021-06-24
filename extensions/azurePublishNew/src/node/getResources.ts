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

  return availableResources.reduce((resources: GetResourcesResult[], currentResource: ResourceDefinition) => {
    const service = provisionServices[currentResource.key];
    if (service.getRecommendationForProject(project) !== 'notAllowed') {
      resources.push({
        ...currentResource,
        required: service.getRecommendationForProject(project) === 'required',
      });
    }
    return resources;
  }, []);
};
