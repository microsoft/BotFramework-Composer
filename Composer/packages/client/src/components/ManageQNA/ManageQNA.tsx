// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';
import { SearchManagementClient } from '@azure/arm-search';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import formatMessage from 'format-message';

import { ManageService } from '../ManageService/ManageService';

const QNA_REGIONS = [{ key: 'westus', text: 'westus' }];

type ManageQNAProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: { key: string; region: string }) => void;
  onNext?: () => void;
  setVisible: (value: any) => void;
};

export const ManageQNA = (props: ManageQNAProps) => {
  const createService = async (
    tokenCredentials: TokenCredentials,
    subscriptionId: string,
    resourceGroupName: string,
    resourceName: string,
    region: string
  ): Promise<string> => {
    const qnaMakerSearchName = `${resourceName}-search`.toLowerCase().replace('_', '');
    const qnaMakerWebAppName = `${resourceName}-qnahost`.toLowerCase().replace('_', '');
    const qnaMakerServiceName = `${resourceName}-qna`;

    const searchManagementClient = new SearchManagementClient(tokenCredentials as any, subscriptionId);
    await searchManagementClient.services.createOrUpdate(resourceGroupName, qnaMakerSearchName, {
      location: region,
      sku: {
        name: 'standard',
      },
      replicaCount: 1,
      partitionCount: 1,
      hostingMode: 'default',
    });

    const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);
    await webSiteManagementClient.appServicePlans.createOrUpdate(resourceGroupName, resourceGroupName, {
      location: region,
      sku: {
        name: 'S1',
        tier: 'Standard',
        size: 'S1',
        family: 'S',
        capacity: 1,
      },
    });
    // deploy or update exisiting app insights component
    const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
      tokenCredentials,
      subscriptionId
    );
    await applicationInsightsManagementClient.components.createOrUpdate(resourceGroupName, resourceGroupName, {
      location: region,
      applicationType: 'web',
      kind: 'web',
    });

    // add web config for websites
    const azureSearchAdminKey = (await searchManagementClient.adminKeys.get(resourceGroupName, qnaMakerSearchName))
      .primaryKey;
    const appInsightsComponent = await applicationInsightsManagementClient.components.get(
      resourceGroupName,
      resourceGroupName
    );
    const userAppInsightsKey = appInsightsComponent.instrumentationKey;
    const userAppInsightsName = resourceGroupName;
    const userAppInsightsAppId = appInsightsComponent.appId;
    const primaryEndpointKey = `${qnaMakerWebAppName}-PrimaryEndpointKey`;
    const secondaryEndpointKey = `${qnaMakerWebAppName}-SecondaryEndpointKey`;
    const defaultAnswer = 'No good match found in KB.';
    const QNAMAKER_EXTENSION_VERSION = 'latest';

    // deploy qna host webapp
    const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(resourceGroupName, qnaMakerWebAppName, {
      name: qnaMakerWebAppName,
      serverFarmId: resourceGroupName,
      location: region,
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
        ],
      },
      enabled: true,
    });

    // Create qna account
    const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
    await cognitiveServicesManagementClient.accounts.create(resourceGroupName, qnaMakerServiceName, {
      kind: 'QnAMaker',
      sku: {
        name: 'F0',
      },
      location: region,
      properties: {
        apiProperties: {
          qnaRuntimeEndpoint: `https://${webAppResult.hostNames?.[0]}`,
        },
      },
    });

    const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroupName, qnaMakerServiceName);
    if (!keys?.key1) {
      throw new Error('No key found for newly created authoring resource');
    } else {
      return keys.key1;
    }
  };

  return (
    <ManageService
      createService={createService}
      handoffInstructions={formatMessage(
        '1. Using the Azure portal, please create a QnAMaker resource on my behalf.\n2. Once provisioned, securely share the resulting credentials with me as described in the link below.\n\nDetailed instructions:\nhttps://aka.ms/bfcomposerhandoffqnamaker'
      )}
      hidden={props.hidden}
      regions={QNA_REGIONS}
      serviceKeyType={'QnAMaker'}
      serviceName={'QnA Maker'}
      setVisible={props.setVisible}
      onDismiss={props.onDismiss}
      onGetKey={props.onGetKey}
      onNext={props.onNext}
    />
  );
};
