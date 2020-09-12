// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { ResourceManagementClient } from '@azure/arm-resources';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';
import { GraphRbacManagementClient } from '@azure/graph';
import { DeviceTokenCredentials } from '@azure/ms-rest-nodeauth';
import * as fs from 'fs-extra';
import * as rp from 'request-promise';

import { AzureResourceManangerConfig } from './azureResourceManager/azureResourceManagerConfig';
import { AzureResourceMananger } from './azureResourceManager/azureResourceManager';

import { BotProjectDeployConfig } from './botProjectDeployConfig';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';

export class BotProjectProvision {
  private subId: string;
  private accessToken: string;
  private graphToken: string;
  private credentials: any; // credential from interactive login
  private projPath: string;
  private templatePath: string;
  private logger: (string) => any;
  private azureResourceManagementClient?: AzureResourceMananger;

  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.credentials = config.credentials;
    this.projPath = config.projPath;
    // path to the ARM template
    // this is currently expected to live in the code project
    this.templatePath =
      config.templatePath ?? path.join(this.projPath, 'DeploymentTemplates', 'template-with-preexisting-rg.json');
  }

  /*******************************************************************************************************************************/
  /* This section has to do with creating new Azure resources
  /*******************************************************************************************************************************/

  private getErrorMesssage(err) {
    if (err.body) {
      if (err.body.error) {
        if (err.body.error.details) {
          const details = err.body.error.details;
          let errMsg = '';
          for (const detail of details) {
            errMsg += detail.message;
          }
          return errMsg;
        } else {
          return err.body.error.message;
        }
      } else {
        return JSON.stringify(err.body, null, 2);
      }
    } else {
      return JSON.stringify(err, null, 2);
    }
  }

  /**
   * create an application based on the msgraph api
   * @param displayName the name of the application
   */
  private async createApp(displayName: string) {
    const applicationUri = 'https://graph.microsoft.com/v1.0/applications';
    const requestBody = {
      displayName: displayName
    }
    const options = {
      body: requestBody,
      json: true,
      headers: { Authorization: `Bearer ${this.graphToken}` },
    } as rp.RequestPromiseOptions;
    const response = await rp.post(applicationUri, options);
    return response;
  }

  /**
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private async getTenantId() {
    if (!this.accessToken) {
      const token = await this.credentials.getToken();
      this.accessToken = token.accessToken;
      if (!this.accessToken) {
        throw new Error(
          'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
        );
      }
    }
    if (!this.subId) {
      throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
    }
    try {
      const tenantUrl = `https://management.azure.com/subscriptions/${this.subId}?api-version=2020-01-01`;
      const options = {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      } as rp.RequestPromiseOptions;
      const response = await rp.get(tenantUrl, options);
      const jsonRes = JSON.parse(response);
      if (jsonRes.tenantId === undefined) {
        throw new Error(`No tenants found in the account.`);
      }
      return jsonRes.tenantId;
    } catch (err) {
      throw new Error(`Get Tenant Id Failed, details: ${this.getErrorMesssage(err)}`);
    }
  }

  /**
   * Provision a set of Azure resources for use with a bot
   */
  public async create(
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    createLuisResource = true,
    createLuisAuthoringResource = true,
    createCosmosDb = true,
    createStorage = true,
    createAppInsights = true,
    createQnAResource = true,
  ) {
    if (!this.tenantId) {
      this.tenantId = await this.getTenantId();
    }
    const graphcredentials = new DeviceTokenCredentials(
      this.credentials.clientId,
      this.tenantId,
      this.credentials.username,
      'graph',
      this.credentials.environment,
      this.credentials.tokenCache
    );
    const graphClient = new GraphRbacManagementClient(graphcredentials, this.tenantId, {
      baseUri: 'https://graph.windows.net',
    });

    const settings: any = {};

    // Validate settings
    let appId = settings.MicrosoftAppId;

    // If the appId is not specified, create one
    if (!appId) {
      // this requires an app password. if one not specified, fail.
      if (!appPassword) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_INFO,
          message: `App password is required`,
        });
        throw new Error(`App password is required`);
      }
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: '> Creating App Registration ...',
      });

      // create the app registration
      const appCreated = await this.createApp(name);
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: appCreated,
      });

      // use the newly created app
      appId = appCreated.appId;
    }

    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Create App Id Success! ID: ${appId}`,
    });

    const resourceGroupName = `${name}`;

    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();
    // azure resource manager class config
    // azure resource manager class config
    const armConfig = {
      createOrNot: {
        appInsights: createAppInsights || createQnAResource,
        cosmosDB: createCosmosDb,
        blobStorage: createStorage,
        luisResource: createLuisResource,
        luisAuthoringResource: createLuisAuthoringResource,
        qnaResource: createQnAResource,
        webApp: true,
        bot: true,
        deployments: true
      },
      bot: {
        appId: appId ?? undefined
      },
      webApp: {
        appId: appId ?? '',
        appPwd: appPassword ?? ''
      },
      resourceGroup: {
        name: resourceGroupName,
        location: location
      },
      qnaResource: {
        resourceGroupName: resourceGroupName,
        location: location,
        accountName: resourceGroupName
      },
      subId: this.subId,
      credentials: this.credentials,
      logger: this.logger
    } as AzureResourceManangerConfig;
    const armInstance = new AzureResourceMananger(armConfig);
    if (!this.azureResourceManagementClient) {
      this.azureResourceManagementClient = armInstance;
    }

    await armInstance.deployResources();

    // If application insights created, update the application insights settings in azure bot service
    if (createAppInsights) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> Linking Application Insights settings to Bot Service ...`,
      });

      const appinsightsClient = new ApplicationInsightsManagementClient(this.credentials, this.subId);
      const appComponents = await appinsightsClient.components.get(resourceGroupName, resourceGroupName);
      const appinsightsId = appComponents.appId;
      const appinsightsInstrumentationKey = appComponents.instrumentationKey;
      const apiKeyOptions = {
        name: `${resourceGroupName}-provision-${timeStamp}`,
        linkedReadProperties: [
          `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/api`,
          `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/agentconfig`,
        ],
        linkedWriteProperties: [
          `/subscriptions/${this.subId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/annotations`,
        ],
      };
      const appinsightsApiKeyResponse = await appinsightsClient.aPIKeys.create(
        resourceGroupName,
        resourceGroupName,
        apiKeyOptions
      );
      const appinsightsApiKey = appinsightsApiKeyResponse.apiKey;

      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> AppInsights AppId: ${appinsightsId} ...`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> AppInsights InstrumentationKey: ${appinsightsInstrumentationKey} ...`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> AppInsights ApiKey: ${appinsightsApiKey} ...`,
      });

      if (appinsightsId && appinsightsInstrumentationKey && appinsightsApiKey) {
        const botServiceClient = new AzureBotService(this.credentials, this.subId);
        const botCreated = await botServiceClient.bots.get(resourceGroupName, name);
        if (botCreated.properties) {
          botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
          botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
          botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
          const botUpdateResult = await botServiceClient.bots.update(resourceGroupName, name, botCreated);

          if (botUpdateResult._response.status != 200) {
            this.logger({
              status: BotProjectDeployLoggerType.PROVISION_ERROR,
              message: `! Something went wrong while trying to link Application Insights settings to Bot Service Result: ${JSON.stringify(
                botUpdateResult
              )}`,
            });
            throw new Error(`Linking Application Insights Failed.`);
          }
          this.logger({
            status: BotProjectDeployLoggerType.PROVISION_INFO,
            message: `> Linking Application Insights settings to Bot Service Success!`,
          });
        } else {
          this.logger({
            status: BotProjectDeployLoggerType.PROVISION_WARNING,
            message: `! The Bot doesn't have a keys properties to update.`,
          });
        }
      }
    }
    const output = armInstance.getOutput();
    const applicationOutput = {
      MicrosoftAppId: appId,
      MicrosoftAppPassword: appPassword
    };
    Object.assign(output, applicationOutput);

    let provisionResult = {};

    provisionResult['settings'] = output;
    provisionResult['name'] = name;
    if (createLuisResource) {
      provisionResult['luisResource'] = `${name}-luis`;
    } else {
      provisionResult['luisResource'] = '';
    }

    return provisionResult;
  }
}
