// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpHeaders, ServiceClientCredentials, TokenCredentials, WebResourceLike } from '@azure/ms-rest-js';
import { SearchManagementClient } from '@azure/arm-search';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';

import {
  ProvisionMethod,
  ProvisionServiceConfig,
  ProvisionWorkingSet,
  ResourceConfig,
  ResourceDefinition,
  ResourceProvisionService,
} from '../types';
import {
  createCustomizeError,
  ProvisionErrors,
  stringifyError,
} from '../../../../azurePublish/src/node/utils/errorHandler';
import { AzureResourceTypes } from '../constants';

import { COGNITIVE_SERVICES_GROUP_NAME, SO_STANDARD_TIER } from './constants';

export const qnaDefinition: ResourceDefinition = {
  key: 'qna',
  description:
    'QnA Maker is a cloud-based API service that lets you create a conversational question-and-answer layer over your existing data. Use it to build a knowledge base by extracting questions and answers from your content, including FAQs, manuals, and documents.',
  text: 'Microsoft QnA Maker',
  tier: SO_STANDARD_TIER,
  group: COGNITIVE_SERVICES_GROUP_NAME,
  dependencies: [AzureResourceTypes.RESOURCE_GROUP, AzureResourceTypes.WEBAPP],
};

export type QnAResourceConfig = ResourceConfig & {
  key: 'qna';
  resourceGroupName: string;
  location: string;
  name: string;
  sku?: string;
};

const qnAProvisionMethod = (provisionConfig: ProvisionServiceConfig): ProvisionMethod => {
  const getServiceCredentials = (): ServiceClientCredentials => {
    return {
      signRequest: (webResource: WebResourceLike): Promise<WebResourceLike> => {
        if (!webResource.headers) webResource.headers = new HttpHeaders();
        webResource.headers.set('authorization', `Bearer ${provisionConfig.accessToken}`);
        return Promise.resolve(webResource);
      },
    };
  };

  const searchMgmtCredentials = getServiceCredentials() as any;
  const searchManagementClient = new SearchManagementClient(searchMgmtCredentials, provisionConfig.subscriptionId);
  const tokenCredentials = new TokenCredentials(provisionConfig.accessToken);
  const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
    tokenCredentials,
    provisionConfig.subscriptionId
  );
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, provisionConfig.subscriptionId);
  const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(
    tokenCredentials,
    provisionConfig.subscriptionId
  );

  const createOrUpdateSearchService = async (config: QnAResourceConfig, qnaMakerSearchName: string) => {
    await searchManagementClient.services.createOrUpdate(config.resourceGroupName, qnaMakerSearchName, {
      location: config.location,
      sku: {
        name: 'standard',
      },
      replicaCount: 1,
      partitionCount: 1,
      hostingMode: 'default',
    });
  };

  const createOrUpdateServicePlan = async (name: string, config: QnAResourceConfig) => {
    return await webSiteManagementClient.appServicePlans.createOrUpdate(config.resourceGroupName, name, {
      location: config.location,
      sku: {
        name: 'S1',
        tier: 'Standard',
        size: 'S1',
        family: 'S',
        capacity: 1,
      },
    });
  };

  const createOrUpdateAppInsights = async (name: string, config: QnAResourceConfig) => {
    return await applicationInsightsManagementClient.components.createOrUpdate(config.resourceGroupName, name, {
      location: config.location,
      applicationType: 'web',
      kind: 'web',
    });
  };

  const createOrUpdateQnAAccount = async (
    config: QnAResourceConfig,
    qnaMakerServiceName: string,
    qnaEndpoint: string
  ) => {
    return await cognitiveServicesManagementClient.accounts.create(config.resourceGroupName, qnaMakerServiceName, {
      kind: 'QnAMaker',
      sku: {
        name: config.sku ?? 'S0',
      },
      location: config.location,
      properties: {
        apiProperties: {
          qnaRuntimeEndpoint: `https://${qnaEndpoint}`,
        },
      },
    });
  };

  const getSubscriptionKey = async (config: QnAResourceConfig, qnaMakerServiceName: string) => {
    const keys = await cognitiveServicesManagementClient.accounts.listKeys(
      config.resourceGroupName,
      qnaMakerServiceName
    );
    return keys?.key1 ?? '';
  };

  const deployWebApp = async (
    config: ResourceConfig & { resourceGroupName: string; location: string },
    qnaMakerWebAppName: string,
    servicePlanName: string,
    qnaMakerSearchName: string,
    azureSearchAdminKey: string,
    appInsightsName: string
  ) => {
    const appInsightsComponent = await applicationInsightsManagementClient.components.get(
      config.resourceGroupName,
      appInsightsName
    );
    const userAppInsightsKey = appInsightsComponent.instrumentationKey;
    const userAppInsightsName = appInsightsName;
    const userAppInsightsAppId = appInsightsComponent.appId;
    const primaryEndpointKey = `${qnaMakerWebAppName}-PrimaryEndpointKey`;
    const secondaryEndpointKey = `${qnaMakerWebAppName}-SecondaryEndpointKey`;
    const defaultAnswer = 'No good match found in KB.';
    const QNAMAKER_EXTENSION_VERSION = 'latest';
    const EnableMultipleTestIndex = 'true';

    return await webSiteManagementClient.webApps.createOrUpdate(config.resourceGroupName, qnaMakerWebAppName, {
      name: qnaMakerWebAppName,
      serverFarmId: servicePlanName,
      location: config.location,
      siteConfig: {
        cors: {
          allowedOrigins: ['*'],
        },
        appSettings: [
          {
            name: 'AzureSearchName',
            value: qnaMakerSearchName,
          },
          {
            name: 'AzureSearchAdminKey',
            value: azureSearchAdminKey,
          },
          {
            name: 'UserAppInsightsKey',
            value: userAppInsightsKey,
          },
          {
            name: 'UserAppInsightsName',
            value: userAppInsightsName,
          },
          {
            name: 'UserAppInsightsAppId',
            value: userAppInsightsAppId,
          },
          {
            name: 'PrimaryEndpointKey',
            value: primaryEndpointKey,
          },
          {
            name: 'SecondaryEndpointKey',
            value: secondaryEndpointKey,
          },
          {
            name: 'DefaultAnswer',
            value: defaultAnswer,
          },
          {
            name: 'QNAMAKER_EXTENSION_VERSION',
            value: QNAMAKER_EXTENSION_VERSION,
          },
          {
            name: 'EnableMultipleTestIndex',
            value: EnableMultipleTestIndex,
          },
        ],
      },
      enabled: true,
    });
  };

  return async (config: QnAResourceConfig, workingSet: ProvisionWorkingSet): Promise<ProvisionWorkingSet> => {
    // initialize the name
    const qnaMakerSearchName = `${config.name}-search`.toLowerCase().replace('_', '');
    const qnaMakerWebAppName = `${config.name}-qnahost`.toLowerCase().replace('_', '');
    const qnaMakerServiceName = `${config.name}-qna`;

    const qnaServicePlanName = config.resourceGroupName;
    const qnaAppInsightsName = config.resourceGroupName;
    // only support westus in qna
    if (config.location !== 'westus') {
      config.location = 'westus';
    }

    try {
      // Deploy search service
      await createOrUpdateSearchService(config, qnaMakerSearchName);

      // Create new or update the Service Plan for QnA Maker
      const servicePlanResult = await createOrUpdateServicePlan(qnaServicePlanName, config);

      // Create new or update App Insights for QnA Maker
      await createOrUpdateAppInsights(qnaAppInsightsName, config);

      // add web config for websites
      const azureSearchKeys = await searchManagementClient.adminKeys.get(config.resourceGroupName, qnaMakerSearchName);
      const azureSearchAdminKey = azureSearchKeys.primaryKey;

      // deploy qna host webapp
      const webAppResult = await deployWebApp(
        config,
        qnaMakerWebAppName,
        servicePlanResult.name,
        qnaMakerSearchName,
        azureSearchAdminKey,
        qnaAppInsightsName
      );

      // Create qna account
      const qnaWebAppEndpoint = webAppResult.hostNames?.[0];
      await createOrUpdateQnAAccount(config, qnaMakerServiceName, qnaWebAppEndpoint);

      // Get subscription key
      const subscriptionKey = await getSubscriptionKey(config, qnaMakerServiceName);

      return {
        ...workingSet,
        qna: { endpoint: qnaWebAppEndpoint, subscriptionKey: subscriptionKey },
      };
    } catch (err) {
      throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, stringifyError(err));
    }
  };
};

export const getQnAProvisionService = (config: ProvisionServiceConfig): ResourceProvisionService => {
  return {
    getDependencies: () => ['webApp'],
    getRecommendationForProject: (project) => {
      return project.isQnARequired; // tbd
    },
    provision: qnAProvisionMethod(config),
    canPollStatus: false,
  };
};
