// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AxiosRequestConfig } from 'axios';
import * as rp from 'request-promise';

import { createCustomizeError, ProvisionErrors } from '../../../../azurePublish/src/node/utils/errorHandler';
import { ProvisionConfig, ProvisionWorkingSet, ResourceProvisionService } from '../types';

import { AppRegistrationResult } from './types';

const sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

const postRequestWithRetry = async (requestUri: string, requestOptions: AxiosRequestConfig) => {
  let result;
  let retryCount = 3;

  while (retryCount >= 0) {
    try {
      result = await rp.post(requestUri, requestOptions);
    } catch (err) {
      if (err.response?.status == 401) {
        throw createCustomizeError(ProvisionErrors.CREATE_APP_REGISTRATION, 'Authentication expired');
      } else if (retryCount == 0) {
        throw createCustomizeError(
          ProvisionErrors.CREATE_APP_REGISTRATION,
          'App create failed! Please file an issue on Github.'
        );
      } else {
        await sleep(3000);
        retryCount--;
        continue;
      }
    }

    break;
  }

  return result;
};

const appRegistrationProvisionMethod = async (
  config: ProvisionConfig,
  workingSet: ProvisionWorkingSet
): Promise<ProvisionWorkingSet> => {
  const { graphToken } = config.credentials;
  const requestOptions: rp.RequestPromiseOptions = {
    json: true,
    headers: { Authorization: `Bearer ${graphToken}` },
  } as rp.RequestPromiseOptions;

  const createApp = async (displayName: string) => {
    const createApplicationUri = 'https://graph.microsoft.com/v1.0/applications';

    requestOptions.body = {
      displayName: displayName,
    };

    // This call if successful returns an object in the form
    // documented here: https://docs.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0#properties
    // we need the `appId` and `id` fields - appId is part of our configuration, and the `id` is used to set the password.
    return await postRequestWithRetry(createApplicationUri, requestOptions);
  };

  const addPassword = async (displayName: string, appCreatedId: string) => {
    const addPasswordUri = `https://graph.microsoft.com/v1.0/applications/${appCreatedId}/addPassword`;
    requestOptions.body = {
      passwordCredential: {
        displayName: `${displayName}-pwd`,
      },
    };
    const passwordSet = await postRequestWithRetry(addPasswordUri, requestOptions);
    return passwordSet.secretText;
  };

  const { webAppName } = config;
  const { appId, id } = await createApp(webAppName);
  const appPassword = await addPassword(webAppName, id);

  const provisionResult: AppRegistrationResult = { key: 'appRegistration', appId, appPassword };

  return {
    ...workingSet,
    appRegistration: provisionResult,
  };
};

export const getAppRegistrationProvisionService = (config: ProvisionConfig): ResourceProvisionService => {
  return {
    getDependencies: () => [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getRecommendationForProject: (project) => 'required',
    provision: appRegistrationProvisionMethod,
  };
};
