// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';
import * as rp from 'request-promise';

import { BotProjectDeployLoggerType } from './types';
import { AzureResourceManangerConfig } from './azureResourceManager/azureResourceManagerConfig';
import { AzureResourceMananger } from './azureResourceManager/azureResourceManager';
import { AzureResourceTypes } from './resourceTypes';
import { createCustomizeError, ProvisionErrors, stringifyError } from './utils/errorHandler';

export interface ProvisionConfig {
  accessToken: string;
  graphToken: string;
  tenantId?: string;
  hostname: string; // for previous bot, it's ${name}-${environment}
  externalResources: ResourceType[];
  location: { id: string; name: string; displayName: string };
  luisLocation: string;
  subscription: { subscriptionId: string; tenantId: string; displayName: string };
  logger?: (string) => any;
  name: string; // profile name
  type: string; // webapp or function
  choice?: string;
  [key: string]: any;
}

interface ResourceType {
  key: string;
  // other keys TBD
  [key: string]: any;
}

export class BotProjectProvision {
  private subscriptionId: string;
  private accessToken: string;
  private graphToken: string;
  private logger: (string) => any;
  private azureResourceManagementClient?: AzureResourceMananger;
  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: ProvisionConfig) {
    this.subscriptionId = config.subscription.subscriptionId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.graphToken = config.graphToken;
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

  // TODO: Move these into the azure resource manager class
  /***********************************************************************************************
   * Azure API accessors
   **********************************************************************************************/
  /*
   * create the applicationId for the bot registration
   * Docs: https://docs.microsoft.com/en-us/graph/api/application-post-applications?view=graph-rest-1.0&tabs=http
   */
  private async createApp(displayName: string): Promise<{ appId: string; appPassword: string }> {
    const applicationUri = 'https://graph.microsoft.com/v1.0/applications';

    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: '> Creating App Registration ...',
    });

    const appCreateOptions = {
      body: {
        displayName: displayName,
      },
      json: true,
      headers: { Authorization: `Bearer ${this.graphToken}` },
    } as rp.RequestPromiseOptions;

    // This call if successful returns an object in the form
    // documented here: https://docs.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0#properties
    // we need the `appId` and `id` fields - appId is part of our configuration, and the `id` is used to set the password.
    let appCreated;
    try {
      appCreated = await rp.post(applicationUri, appCreateOptions);
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `App create failed: ${JSON.stringify(err, null, 4)}`,
      });
      throw createCustomizeError(ProvisionErrors.CREATE_APP_REGISTRATION, 'App create failed!');
    }
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `Start to add password for App, Id : ${appCreated.appId}`,
    });

    const appId = appCreated.appId;

    // use id to add new password and save the password as configuration
    const addPasswordUri = `https://graph.microsoft.com/v1.0/applications/${appCreated.id}/addPassword`;
    const requestBody = {
      passwordCredential: {
        displayName: `${displayName}-pwd`,
      },
    };
    const setSecretOptions = {
      body: requestBody,
      json: true,
      headers: { Authorization: `Bearer ${this.graphToken}` },
    } as rp.RequestPromiseOptions;

    let passwordSet;
    try {
      passwordSet = await rp.post(addPasswordUri, setSecretOptions);
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `Add application password failed: ${JSON.stringify(err, null, 4)}`,
      });
      throw createCustomizeError(ProvisionErrors.CREATE_APP_REGISTRATION, 'Add application password failed!');
    }

    const appPassword = passwordSet.secretText;

    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Create App Registration Success! ID: ${appId}`,
    });

    return { appId, appPassword };
  }

  // TODO: Move this into the azure resouce manager class
  /**
   * Return the tenantId based on a subscription
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private async getTenantId() {
    if (!this.accessToken) {
      throw createCustomizeError(
        ProvisionErrors.GET_TENANTID,
        'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
      );
    }
    if (!this.subscriptionId) {
      throw createCustomizeError(
        ProvisionErrors.GET_TENANTID,
        `Error: Missing subscription Id. Please provide a valid Azure subscription id.`
      );
    }
    try {
      const tenantUrl = `https://management.azure.com/subscriptions/${this.subscriptionId}?api-version=2020-01-01`;
      const options = {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      } as rp.RequestPromiseOptions;
      const response = await rp.get(tenantUrl, options);
      const jsonRes = JSON.parse(response);
      if (jsonRes.tenantId === undefined) {
        throw createCustomizeError(ProvisionErrors.GET_TENANTID, `No tenants found in the account.`);
      }
      return jsonRes.tenantId;
    } catch (err) {
      throw createCustomizeError(
        ProvisionErrors.GET_TENANTID,
        `Get Tenant Id Failed, details: ${this.getErrorMesssage(err)}`
      );
    }
  }

  /**
   * Provision a set of Azure resources for use with a bot
   */
  public async create(config: ProvisionConfig) {
    try {
      // ensure a tenantId is available.
      if (!this.tenantId) {
        this.tenantId = await this.getTenantId();
      }

      // tokenCredentials is used for authentication across the API calls
      const tokenCredentials = new TokenCredentials(this.accessToken);

      // this object collects all of the various configuration output
      const provisionResults = {
        appId: null,
        appPassword: null,
        resourceGroup: null,
        webApp: null,
        luisPrediction: null,
        luisAuthoring: null,
        blobStorage: null,
        cosmosDB: null,
        appInsights: null,
        qna: null,
        botName: null,
      };

      const resourceGroupName = `${config.hostname}`;

      // azure resource manager class config
      const armConfig = {
        subscriptionId: this.subscriptionId,
        creds: tokenCredentials,
        logger: this.logger,
      } as AzureResourceManangerConfig;

      // This object is used to actually make the calls to Azure...
      this.azureResourceManagementClient = new AzureResourceMananger(armConfig);

      // Ensure the resource group is ready
      provisionResults.resourceGroup = await this.azureResourceManagementClient.createResourceGroup({
        name: resourceGroupName,
        location: config.location.name,
      });

      // SOME OF THESE MUST HAPPEN IN THE RIGHT ORDER!
      // TODO: ensure the sort order?
      // app reg first (get app id)
      // then bot webapp (get endpoint)
      // then bot reg (use app id and endpoint)

      // Loop over the list of required resources and take the actions necessary to create them.
      for (let x = 0; x < config.externalResources.length; x++) {
        const resourceToCreate = config.externalResources[x];
        switch (resourceToCreate.key) {
          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create the appId and appPassword - this is usually the first step.
          case AzureResourceTypes.APP_REGISTRATION:
            // eslint-disable-next-line no-case-declarations
            const { appId, appPassword } = await this.createApp(config.hostname);
            provisionResults.appId = appId;
            provisionResults.appPassword = appPassword;
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create a web app to host the bot
          case AzureResourceTypes.WEBAPP:
            // eslint-disable-next-line no-case-declarations
            const hostname = await this.azureResourceManagementClient.deployWebAppResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname,
              appId: provisionResults.appId,
              appPwd: provisionResults.appPassword,
            });
            provisionResults.webApp = {
              hostname: hostname,
            };
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create the Azure Bot Service registration
          case AzureResourceTypes.BOT_REGISTRATION:
            await this.azureResourceManagementClient.deployBotResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname, // come back to this!
              displayName: config.hostname, // todo: this may be wrong!
              endpoint: `https://${provisionResults.webApp.hostname}/api/messages`,
              appId: provisionResults.appId,
              webAppHostname: provisionResults.webApp.hostname
            });
            provisionResults.botName = config.hostname;
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create the Azure Bot Service registration
          case AzureResourceTypes.AZUREFUNCTIONS: {
            const functionsHostName = await this.azureResourceManagementClient.deployAzureFunctions({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname,
              appId: provisionResults.appId,
              appPwd: provisionResults.appPassword,
            });
            provisionResults.webApp = {
              hostname: functionsHostName,
            };
            break;
          }

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create the Cosmo DB for state
          case AzureResourceTypes.COSMOSDB:
            provisionResults.cosmosDB = await this.azureResourceManagementClient.deployCosmosDBResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname.replace(/_/g, '').substr(0, 31).toLowerCase(),
              databaseName: `botstate-db`,
              containerName: `botstate-container`,
            });
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create the app insights for telemetry
          case AzureResourceTypes.APPINSIGHTS:
            provisionResults.appInsights = await this.azureResourceManagementClient.deployAppInsightsResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname,
            });

            // connect the new app insights stuff to the bot registration (if created)
            if (config.externalResources.find((r) => r.key === AzureResourceTypes.BOT_REGISTRATION)) {
              await this.azureResourceManagementClient.connectAppInsightsToBotService({
                resourceGroupName: resourceGroupName,
                name: config.hostname,
              });
            }

            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create a LUIS authoring key
          case AzureResourceTypes.LUIS_AUTHORING:
            provisionResults.luisAuthoring = await this.azureResourceManagementClient.deployLuisAuthoringResource({
              resourceGroupName: resourceGroupName,
              location: config.luisLocation,
              name: `${config.hostname}-luis-authoring`,
            });

            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create a LUIS prediction key
          case AzureResourceTypes.LUIS_PREDICTION:
            // eslint-disable-next-line no-case-declarations
            provisionResults.luisPrediction = await this.azureResourceManagementClient.deployLuisResource({
              resourceGroupName: resourceGroupName,
              location: config.luisLocation,
              name: `${config.hostname}-luis`,
            });
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create a blob storage for transcripts
          case AzureResourceTypes.BLOBSTORAGE:
            // eslint-disable-next-line no-case-declarations
            provisionResults.blobStorage = await this.azureResourceManagementClient.deployBlobStorageResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname.toLowerCase().replace(/-/g, '').replace(/_/g, ''),
              containerName: 'transcripts',
            });
            break;

          /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
          // Create qna account and related search resources
          case AzureResourceTypes.QNA:
            provisionResults.qna = await this.azureResourceManagementClient.deployQnAReource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: `${config.hostname}-qna`,
            });
            break;
        }
      }

      // TODO: NOT SURE WHAT THIS DOES! Something about tracking what deployments happen because of composer?
      // await this.azureResourceManagementClient.deployDeploymentCounter({
      //   resourceGroupName: resourceGroupName,
      //   name: '1d41002f-62a1-49f3-bd43-2f3f32a19cbb', // WHAT IS THIS CONSTANT???
      // });

      return provisionResults;
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw stringifyError(err);
    }
  }
}
