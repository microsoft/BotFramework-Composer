// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */

import axios from 'axios';
import formatMessage from 'format-message';
import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ResourceNameAvailability } from '@azure/arm-appservice/esm/models';
import { TokenCredentials } from '@azure/ms-rest-js';
import debug from 'debug';
import sortBy from 'lodash/sortBy';

import { AzureAPIStatus } from './types';

const logger = debug('composer:extension:azureProvision');

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

export const getDeployLocations = async (token: string, subscriptionId: string) => {
  try {
    const result = await axios.get(
      `https://management.azure.com/subscriptions/${subscriptionId}/locations?api-version=2019-10-01`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return result.data.value;
  } catch (error) {
    // popup window to login
    if (error.response.data.redirectUri) {
      // await loginPopup();
      // TODO: Fix this
      alert('NOT LOGGED IN');
    }
  }
};

export const checkWebAppNameAvailability = async (
  token: string,
  webAppName: string,
  subscriptionId: string
): Promise<ResourceNameAvailability> => {
  try {
    if (!webAppName) {
      logger({
        status: AzureAPIStatus.PARAM_ERROR,
        message: 'Need webapp name as a parameter.',
      });
      return {
        nameAvailable: false,
        message: 'Invalid param: webapp name',
      } as ResourceNameAvailability;
    }
    if (!subscriptionId) {
      logger({
        status: AzureAPIStatus.PARAM_ERROR,
        message: 'Need subscription id as a parameter.',
      });
      return {
        nameAvailable: false,
        message: 'Invalid param: subscription id',
      } as ResourceNameAvailability;
    }
    const credentials = new TokenCredentials(token);
    const webSiteManagementClient = new WebSiteManagementClient(credentials, subscriptionId);
    const getCheckNameAvailabilityResult = await webSiteManagementClient.checkNameAvailability(
      webAppName,
      'Microsoft.Web/sites'
    );
    if (getCheckNameAvailabilityResult._response.status >= 300) {
      logger({
        status: AzureAPIStatus.ERROR,
        message: getCheckNameAvailabilityResult._response.bodyAsText,
      });
      return {
        nameAvailable: false,
        message: `Invalid request: ${getCheckNameAvailabilityResult._response.bodyAsText}`,
      } as ResourceNameAvailability;
    }
    return getCheckNameAvailabilityResult._response.parsedBody;
  } catch (err) {
    logger({
      status: AzureAPIStatus.ERROR,
      message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });
    return {
      nameAvailable: false,
      message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    } as ResourceNameAvailability;
  }
};
