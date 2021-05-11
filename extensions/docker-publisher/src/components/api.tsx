// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import formatMessage from 'format-message';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup, GenericResource } from '@azure/arm-resources/esm/models';
// import { AzureBotService } from '@azure/arm-botservice';
// import { WebSiteManagementClient } from '@azure/arm-appservice';
// import { ResourceNameAvailability } from '@azure/arm-appservice/esm/models';
// import { CheckNameAvailabilityResponseBody } from '@azure/arm-botservice/esm/models';
// import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';
import debug from 'debug';
import sortBy from 'lodash/sortBy';

const logger = debug('composer:extension:dockerPublish');

import {
  AzureAPIStatus,
  // AzureResourceProviderType,
  // ResourcesItem,
  // LuisAuthoringSupportLocation,
  // LuisPublishSupportLocation,
} from '../types/azureTypes';

/**
 * Retrieves the list of subscriptions from Azure
 * @param token The authentication token
 * @returns The list of subscriptions or throws
 */
export const getSubscriptions = async (token: string): Promise<Array<Subscription>> => {
  const tokenCredentials = new TokenCredentials(token);
  try {
    const subscriptionClient = new SubscriptionClient(tokenCredentials);
    const subscriptionsResult = await subscriptionClient.subscriptions.list();
    if (subscriptionsResult._response.status >= 300) {
      logger({
        status: AzureAPIStatus.ERROR,
        message: subscriptionsResult._response.bodyAsText,
      });
      throw new Error(subscriptionsResult._response.bodyAsText);
    }
    return sortBy(subscriptionsResult._response.parsedBody, ['displayName']);
  } catch (err) {
    let message = JSON.stringify(err, Object.getOwnPropertyNames(err));
    if (err?.code === 12 && err?.message?.match(/Bearer/gi)) {
      message = formatMessage(
        'There was an authentication problem retrieving subscriptions. Verify your login session has not expired and you have permission to list subscriptions in this account.'
      );
    }

    logger({
      status: AzureAPIStatus.ERROR,
      message,
    });
    throw new Error(message);
  }
};

export const getResourceGroups = async (token: string, subscriptionId: string): Promise<Array<ResourceGroup>> => {
  try {
    if (!subscriptionId) {
      logger({
        status: AzureAPIStatus.PARAM_ERROR,
        message: 'Need subscription or subscription id as a parameter.',
      });
      return [];
    }
    const tokenCredentials = new TokenCredentials(token);
    const resourceManagementClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
    const resourceGroupsResult = await resourceManagementClient.resourceGroups.list();
    if (resourceGroupsResult._response.status >= 300) {
      logger({
        status: AzureAPIStatus.ERROR,
        message: resourceGroupsResult._response.bodyAsText,
      });
      return [];
    }
    return sortBy(resourceGroupsResult._response.parsedBody, ['name']);
  } catch (err) {
    logger({
      status: AzureAPIStatus.ERROR,
      message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });
    return [];
  }
};

/**
 *  get resources by resource group
 */
export const getResources = async (
  token: string,
  subscriptionId: string,
  resourceGroupName: string
): Promise<Array<GenericResource>> => {
  try {
    if (!subscriptionId) {
      logger({
        status: AzureAPIStatus.PARAM_ERROR,
        message: 'Need subscription or subscription id as a parameter.',
      });
      return [];
    }
    if (!resourceGroupName) {
      logger({
        status: AzureAPIStatus.PARAM_ERROR,
        message: 'Need resource group name as a parameter.',
      });
      return [];
    }
    const tokenCredentials = new TokenCredentials(token);
    const resourceManagementClient = new ResourceManagementClient(tokenCredentials, subscriptionId);
    const listByResourceGroupResult = await resourceManagementClient.resources.listByResourceGroup(resourceGroupName);
    if (listByResourceGroupResult._response.status >= 300) {
      logger({
        status: AzureAPIStatus.ERROR,
        message: listByResourceGroupResult._response.bodyAsText,
      });
      return [];
    }
    return listByResourceGroupResult._response.parsedBody;
  } catch (err) {
    logger({
      status: AzureAPIStatus.ERROR,
      message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });
    return [];
  }
};
