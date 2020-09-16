// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import * as fs from 'fs-extra';
import * as rp from 'request-promise';

import { BotProjectDeployConfig } from './botProjectDeployConfig';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';
import { AzureResourceManangerConfig } from './azureResourceManager/azureResourceManagerConfig';
import { AzureResourceMananger, AzureResourceDeploymentStatus } from './azureResourceManager/azureResourceManager';

export class BotProjectProvision {
  private subId: string;
  private accessToken: string;
  private graphToken: string;
  private projPath: string;
  private logger: (string) => any;
  private azureResourceManagementClient?: AzureResourceMananger;
  // Will be assigned by create or deploy
  private tenantId = '';


  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.graphToken = config.graphToken;
    this.projPath = config.projPath;

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

  /***********************************************************************************************
   * Azure API accessors
   **********************************************************************************************/
  private async createApp(displayName: string) {
    const applicationUri = 'https://graph.microsoft.com/v1.0/applications';
    const requestBody = {
      displayName: displayName,
    };
    const options = {
      body: requestBody,
      json: true,
      headers: { Authorization: `Bearer ${this.graphToken}` },
    } as rp.RequestPromiseOptions;
    const response = await rp.post(applicationUri, options);
    return response;
  }

  private async addPassword(displayName: string, id: string) {
    const addPasswordUri = `https://graph.microsoft.com/v1.0/applications/${id}/addPassword`;
    const requestBody = {
      passwordCredential: {
        displayName: `${displayName}-pwd`,
      },
    };
    const options = {
      body: requestBody,
      json: true,
      headers: { Authorization: `Bearer ${this.graphToken}` },
    } as rp.RequestPromiseOptions;
    const response = await rp.post(addPasswordUri, options);
    return response;
  }

  /**
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private async getTenantId() {
    if (!this.accessToken) {
      throw new Error(
        'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
      );
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
    hostname: string,
    location: string,
    appId: string,
    appPassword?: string,
    createLuisResource = false,
    createLuisAuthoringResource = false,
    createCosmosDb = false,
    createStorage = false,
    createAppInsights = false
  ) {
    try {
      if (!this.tenantId) {
        this.tenantId = await this.getTenantId();
      }
      const tokenCredentials = new TokenCredentials(this.accessToken);

      // If the appId is not specified, create one
      if (!appId) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_INFO,
          message: '> Creating App Registration ...',
        });

        // create the app registration based on the display name
        const appCreated = await this.createApp(hostname);
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_INFO,
          message: JSON.stringify(appCreated, null, 4),
        });

        // use the newly created app
        appId = appCreated.appId ?? '';
        const id = appCreated.id ?? '';
        if (!id) {
          this.logger({
            status: BotProjectDeployLoggerType.PROVISION_ERROR,
            message: `App create failed: ${JSON.stringify(appCreated, null, 4)}`,
          });
          throw new Error('App create failed!');
        }

        // use id to add new password and save the password as configuration
        const addPasswordResult = await this.addPassword(hostname, id);
        appPassword = addPasswordResult.secretText;
        if (!appPassword) {
          this.logger({
            status: BotProjectDeployLoggerType.PROVISION_ERROR,
            message: `Add application password failed: ${JSON.stringify(addPasswordResult, null, 4)}`,
          });
          throw new Error('Add application password failed!');
        }
      }

      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> Create App Id Success! ID: ${appId}`,
      });

      const resourceGroupName = `${hostname}`;

      // timestamp will be used as deployment name
      const timeStamp = new Date().getTime().toString();

      // azure resource manager class config
      const armConfig = {
        createOrNot: {
          appInsights: createAppInsights,
          cosmosDB: createCosmosDb,
          blobStorage: createStorage,
          luisResource: createLuisResource,
          luisAuthoringResource: createLuisAuthoringResource,
          webApp: true,
          bot: true,
          deployments: true,
        },
        bot: {
          appId: appId ?? undefined,
        },
        webApp: {
          appId: appId ?? '',
          appPwd: appPassword ?? '',
        },
        resourceGroup: {
          name: resourceGroupName,
          location: location,
        },
        subId: this.subId,
        creds: tokenCredentials,
        logger: this.logger,
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

        const appinsightsClient = new ApplicationInsightsManagementClient(tokenCredentials, this.subId);
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
          const botServiceClient = new AzureBotService(tokenCredentials, this.subId);
          const botCreated = await botServiceClient.bots.get(resourceGroupName, hostname);
          if (botCreated.properties) {
            botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
            botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
            botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
            const botUpdateResult = await botServiceClient.bots.update(resourceGroupName, hostname, botCreated);

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
        MicrosoftAppPassword: appPassword,
      };
      Object.assign(output, applicationOutput);

      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: output,
      });

      const provisionResult = {} as any;

      provisionResult.settings = output;
      provisionResult.hostname = hostname;
      if (createLuisResource) {
        provisionResult.luisResource = `${hostname}-luis`;
      } else {
        provisionResult.luisResource = '';
      }

      return provisionResult;
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw err;
    }
  }

  public getProvisionStatus() {
    if (!this.azureResourceManagementClient) {
      return new AzureResourceDeploymentStatus();
    }

    return this.azureResourceManagementClient.getStatus();
  }
}
