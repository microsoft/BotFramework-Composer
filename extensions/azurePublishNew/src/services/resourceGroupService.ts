// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceManagementClient } from '@azure/arm-resources';
import * as msRest from '@azure/ms-rest-js';
import { TokenCredentials } from '@azure/ms-rest-js';
import * as msRestAzure from '@azure/ms-rest-azure-js';
import * as Models from '@azure/arm-resources/src/models/index';
import { ResourceGroupProperties } from '@azure/arm-resources/src/models/index';

import { ProvisionErrors } from '../../../azurePublish/src/node/utils/errorHandler';

import { checkRequirement } from './checkRequirement';

type ResourceGroupsListOptionalParams = {
  filter?: string;
  top?: number;
};

type ResourceGroupsListResponse = {
  readonly nextLink?: string;
  _response: msRest.HttpResponse;
};

type ResourceGroupResponse = {
  readonly id?: string;
  readonly name?: string;
  readonly type?: string;
  properties?: ResourceGroupProperties;
  location: string;
  managedBy?: string;
  tags?: { [propertyName: string]: string };
};

type ResourceGroupsCheckExistenceResponse = {
  body: boolean;
};

export const createResourceGroupService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // Client has retry built in. See: exponentialRetryPolicy, systemErrorRetryPolicy, throttlingRetryPolicy
  const client = new ResourceManagementClient(tokenCredentials, subscriptionId);

  const validateResourceGroupNameNotBlank = (resourceGroupName: string) => {
    checkRequirement(
      !!resourceGroupName,
      ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
      'You should provide a valid resource group location.'
    );
  };

  /**
   * Gets all the resource groups for a subscription.
   * params: options - {ResourceGroupsListOptionalParams}
   * responds with 200 or Error
   * @returns {Promise<ResourceGroupsListResponse>}
   */
  const list = async (options?: ResourceGroupsListOptionalParams): Promise<ResourceGroupsListResponse> => {
    return client.resourceGroups.list(options);
  };

  /**
   * Gets a resource group.
   * Params: resourceGroupName – The name of the resource group to get. The name is case insensitive.
   * options – The optional parameters
   * responds with 200 or Error
   * @returns {Promise<ResourceGroupResponse>}
   */
  const get = async (
    resourceGroupName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<ResourceGroupResponse> => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    return client.resourceGroups.get(resourceGroupName, options);
  };

  /**
   * Updates a resource group
   * params:
   * responds with 200 or Error
   * @returns {Promise<ResourceGroupsListResponse>}
   */
  const update = async (
    resourceGroupName: string,
    params: Models.ResourceGroupPatchable,
    options?: msRest.RequestOptionsBase
  ): Promise<Models.ResourceGroupsUpdateResponse> => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    return client.resourceGroups.update(resourceGroupName, params, options);
  };

  /**
   * Deletes a resource group.
   * Long running process that deletes all of the groups resources
   * Params: resourceGroupName – The name of the resource group to get. The name is case insensitive.
   * options – The optional parameters
   * responds with 200, 202, Error
   * @returns {Promise<msRest.RestResponse>}
   */
  const deleteMethod = async (
    resourceGroupName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.RestResponse> => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    return client.resourceGroups.deleteMethod(resourceGroupName, options);
  };

  /**
   * Delete method that returns a poll for checking the status of request
   * Long running process that deletes all of the groups resources
   * Params: resourceGroupName – The name of the resource group to get. The name is case insensitive.
   * options – The optional parameters
   * @returns {Promise<msRestAzure.LROPoller>}
   */
  const beginDeleteMethod = async (
    resourceGroupName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<msRestAzure.LROPoller> => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    return client.resourceGroups.beginDeleteMethod(resourceGroupName, options);
  };

  const create = async (resourceGroupName: string, location: string, options?: msRest.RequestOptionsBase) => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    checkRequirement(
      !!location,
      ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
      'You should provide a valid resource group location.'
    );

    return client.resourceGroups.createOrUpdate(resourceGroupName, { location: location }, options);
  };

  /**
   * Checks whether a resource group exists.
   * Params:
   * resourceGroupName – The name of the resource group to check. The name is case insensitive.
   * options – The optional parameters
   * responds with 204, 404 or Error
   * @returns {Promise<ResourceGroupsCheckExistenceResponse>}
   */
  const checkNameAvailability = async (
    resourceGroupName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<ResourceGroupsCheckExistenceResponse> => {
    validateResourceGroupNameNotBlank(resourceGroupName);
    return client.resourceGroups.checkExistence(resourceGroupName, options);
  };

  return {
    beginDeleteMethod,
    checkNameAvailability,
    create,
    deleteMethod,
    get,
    list,
    update,
  };
};

export type ResourceGroupService = ReturnType<typeof createResourceGroupService>;
