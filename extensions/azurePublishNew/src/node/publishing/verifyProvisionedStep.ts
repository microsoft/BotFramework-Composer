// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@bfc/shared';

import { ResourcesItem } from '../../types';

import { OnPublishProgress, PublishConfig } from './types';

const isProfileProvisioned = (profile: PublishConfig): boolean => {
  //TODO: Post-migration we can check for profile?.tenantId
  return profile?.resourceGroup && profile?.subscriptionId && profile?.region;
};

const getResources = async (/*project: IBotProject*/): Promise<ResourcesItem[]> => {
  throw new Error('Not implemented.  Should call into provisioning services');
};

// While the provisioning process may return more information for various resources than is checked here,
// this tries to verify the minimum settings are present and that cannot be empty strings.
const isResourceProvisionedInProfile = (resource: ResourcesItem, profile: PublishConfig): boolean => {
  throw new Error('Not implemented.  Needs to use known resource names.');
  /*
  switch (resource.key) {
    case AzureResourceTypes.APPINSIGHTS:
      // InstrumentationKey is Pascal-cased for some unknown reason
      return profile?.settings?.applicationInsights?.InstrumentationKey;
    case AzureResourceTypes.APP_REGISTRATION:
      // MicrosoftAppId and MicrosoftAppPassword are Pascal-cased for some unknown reason
      return profile?.settings?.MicrosoftAppId && profile?.settings?.MicrosoftAppPassword;
    case AzureResourceTypes.BLOBSTORAGE:
      // name is not checked (not in schema.ts)
      // container property is not checked (empty may be a valid value)
      return profile?.settings?.blobStorage?.connectionString;
    case AzureResourceTypes.BOT_REGISTRATION:
      return profile?.botName;
    case AzureResourceTypes.COSMOSDB:
      // collectionId is not checked (not in schema.ts)
      // databaseId and containerId are not checked (empty may be a valid value)
      return profile?.settings?.cosmosDB?.authKey && profile?.settings?.cosmosDB?.cosmosDBEndpoint;
    case AzureResourceTypes.LUIS_AUTHORING:
      // region is not checked (empty may be a valid value)
      return profile?.settings?.luis?.authoringKey && profile?.settings?.luis?.authoringEndpoint;
    case AzureResourceTypes.LUIS_PREDICTION:
      // region is not checked (empty may be a valid value)
      return profile?.settings?.luis?.endpointKey && profile?.settings?.luis?.endpoint;
    case AzureResourceTypes.QNA:
      // endpoint is not checked (it is in schema.ts and provision() returns the value, but it is not set in the config)
      // qnaRegion is not checked (empty may be a valid value)
      return profile?.settings?.qna?.subscriptionKey;
    case AzureResourceTypes.SERVICE_PLAN:
      // no settings exist to verify the service plan was created
      return true;
    case AzureResourceTypes.AZUREFUNCTIONS:
    case AzureResourceTypes.WEBAPP:
      return profile?.hostname;
    default:
      throw new Error(
        formatMessage('Azure resource type {resourceKey} is not handled.', { resourceKey: resource.key })
      );
  }
  */
};

type StepConfig = {
  publishConfig: PublishConfig;
  project: IBotProject;
};

export const verifyProvisionedStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  onProgress('Verifying publish profile has provisioned resources...');

  const { publishConfig, project } = config;

  const { profileName } = publishConfig;

  // verify the profile has been provisioned at least once
  if (!isProfileProvisioned(publishConfig)) {
    throw new Error(
      `There was a problem publishing ${project.name}/${profileName}. The profile has not been provisioned yet.`
    );
  }

  // verify the publish profile has the required resources configured
  const resources = await this.getResources(project);

  const missingResourceNames = resources.reduce((result, resource) => {
    if (resource.required && !isResourceProvisionedInProfile(resource, publishConfig)) {
      result.push(resource.text);
    }
    return result;
  }, []);

  if (missingResourceNames.length > 0) {
    const missingResourcesText = missingResourceNames.join(',');
    throw new Error(
      `There was a problem publishing {project.name}/{profileName}. These required resources have not been provisioned: ${missingResourcesText}`
    );
  }
};
