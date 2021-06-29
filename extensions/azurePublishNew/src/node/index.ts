// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject, IExtensionRegistration, ProcessStatus, PublishPlugin } from '@botframework-composer/types';

import { availableResources, setUpProvisionService } from './availableResources';
import { BackgroundProcessManager } from './backgroundProcessManager';
import { GetResourcesResult, ProvisionConfig, ResourceDefinition, ResourceProvisionService } from './types';

/**
 * Creates the azure publishing plug-in for this extension.
 * @returns The plug-in with properties and methods.
 */
const createAzurePublishPlugin = (): PublishPlugin<ProvisionConfig> => {
  const getResources = (project: IBotProject): Promise<GetResourcesResult[]> => {
    const provisionServices: Record<string, ResourceProvisionService> = {};

    return Promise.resolve(
      availableResources.reduce((resources: GetResourcesResult[], currentResource: ResourceDefinition) => {
        const service = provisionServices[currentResource.key];
        if (service.getRecommendationForProject(project) !== 'notAllowed') {
          resources.push({
            ...currentResource,
            required: service.getRecommendationForProject(project) === 'required',
          });
        }
        return resources;
      }, [])
    );
  };

  const getStatus = async () => {
    return {
      status: 200,
      result: {
        time: new Date().toString(),
        message: 'Publish successful.',
        log: '',
      },
    };
  };

  const provision = async (config: ProvisionConfig, project: IBotProject): Promise<ProcessStatus> => {
    const jobId = BackgroundProcessManager.startProcess(202, project.id, config.key, 'Creating Azure resources...');
    setUpProvisionService(config);
    return BackgroundProcessManager.getStatus(jobId);
  };

  const publish = async (_config, _project, metadata) => {
    const response = {
      status: 202,
      result: {
        time: new Date().toString(),
        message: 'Publish accepted.',
        log: '',
        comment: metadata.comment,
      },
    };
    return response;
  };

  return {
    bundleId: 'publish', // we have custom UI to host
    name: 'azurePublishNew',
    description: 'Publish bot to Azure - new',
    getResources,
    getStatus,
    provision,
    publish,
  };
};

//----- Register the plug in -----//
const initialize = (registration: IExtensionRegistration) => {
  registration.addPublishMethod(createAzurePublishPlugin());

  // test reading and writing data
  registration.log('Reading from store:\n%O', registration.store.readAll());

  registration.store.replace({ some: 'data' });
  registration.log('Reading from store:\n%O', registration.store.readAll());
};

module.exports = {
  initialize,
};
