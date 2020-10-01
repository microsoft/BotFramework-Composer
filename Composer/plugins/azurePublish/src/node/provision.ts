// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import * as rp from 'request-promise';

import { BotProjectDeployLoggerType } from './botProjectLoggerType';
import { AzureResourceManangerConfig } from './azureResourceManager/azureResourceManagerConfig';
import { AzureResourceMananger, AzureResourceDeploymentStatus } from './azureResourceManager/azureResourceManager';

// TODO: fix these duplicated interfaces between here and index.ts
export interface ProvisionConfig {
  // subscriptionId: string;
  // logger: (string) => any;
  accessToken: string;
  graphToken: string;
  tenantId?: string;
  hostname: string; // for previous bot, it's ${name}-${environment}
  externalResources: ResourceType[];
  location: { id: string; name: string; displayName: string };
}

export interface ProvisionerConfig {
  subscriptionId: string;
  logger: (string) => any;
  accessToken: string;
  graphToken: string;
  tenantId?: string;
}

interface ResourceType {
  key: string;
  // other keys TBD
  [key: string]: any;
}

const AzureResourceTypes = {
  APP_REGISTRATION: 'appRegistration',
  BOT_REGISTRATION: 'botRegistration',
  WEBAPP: 'webApp',
  AZUREFUNCTIONS: 'azureFunctions',
  COSMODB: 'cosmoDb',
  APPINSIGHTS: 'applicationInsights',
  LUIS_AUTHORING: 'luisAuthoring',
  LUIS_PREDICTION: 'luisPrediction',
  BLOBSTORAGE: 'blobStorage',
};

export class BotProjectProvision {
  private subscriptionId: string;
  private accessToken: string;
  private graphToken: string;
  private logger: (string) => any;
  private azureResourceManagementClient?: AzureResourceMananger;
  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: ProvisionerConfig) {
    this.subscriptionId = config.subscriptionId;
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
      throw new Error('App create failed!');
    }

    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: JSON.stringify(appCreated, null, 4),
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
      throw new Error('Add application password failed!');
    }

    const appPassword = passwordSet.secretText;

    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Create App Id Success! ID: ${appId}`,
    });

    return { appId, appPassword };
  }

  // /* Set the password for the bot registration */
  // private async addPassword(displayName: string, id: string) {
  //   const addPasswordUri = `https://graph.microsoft.com/v1.0/applications/${id}/addPassword`;
  //   const requestBody = {
  //     passwordCredential: {
  //       displayName: `${displayName}-pwd`,
  //     },
  //   };
  //   const options = {
  //     body: requestBody,
  //     json: true,
  //     headers: { Authorization: `Bearer ${this.graphToken}` },
  //   } as rp.RequestPromiseOptions;
  //   const response = await rp.post(addPasswordUri, options);
  //   return response;
  // }

  /**
   * Return the tenantId based on a subscription
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private async getTenantId() {
    if (!this.accessToken) {
      throw new Error(
        'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
      );
    }
    if (!this.subscriptionId) {
      throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
    }
    try {
      const tenantUrl = `https://management.azure.com/subscriptions/${this.subscriptionId}?api-version=2020-01-01`;
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
    config: ProvisionConfig
    // hostname: string,
    // location: string,
    // appId?: string,
    // appPassword?: string,
    // createLuisResource = false,
    // createLuisAuthoringResource = false,
    // createCosmosDb = false,
    // createStorage = false,
    // createAppInsights = false
  ) {
    try {
      console.log('AZURE PROVISION CREATE CALLED', config);
      // ensure a tenantId is available.
      if (!this.tenantId) {
        this.tenantId = await this.getTenantId();
      }

      // tokenCredentials is used for authentication across the API calls
      const tokenCredentials = new TokenCredentials(this.accessToken);

      const provisionResults = {
        appId: null,
        appPassword: null,
        resourceGroup: null,
        webApp: null,
        luisPrediction: null,
        luisAuthoring: null,
        blobStorage: null,
        cosmoDB: null,
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

      try {
        provisionResults.resourceGroup = await this.azureResourceManagementClient.createResourceGroup({
          name: resourceGroupName,
          location: config.location.name,
        });
      } catch (err) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: err.message,
        });
        throw err;
      }

      // SOME OF THESE MUST HAPPEN IN THE RIGHT ORDER!
      // app reg first (get app id)
      // then bot webapp (get endpoint)
      // then bot reg (use app id and endpoint)

      // Loop over the list of required resources and take the actions necessary to create them.
      for (let x = 0; x < config.externalResources.length; x++) {
        const resourceToCreate = config.externalResources[x];
        switch (resourceToCreate.key) {
          // Create the appId and appPassword - this is usually the first step.
          case AzureResourceTypes.APP_REGISTRATION:
            // eslint-disable-next-line no-case-declarations
            const { appId, appPassword } = await this.createApp(config.hostname);
            provisionResults.appId = appId;
            provisionResults.appPassword = appPassword;
            break;

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

          // Create the Azure Bot Service registration
          case AzureResourceTypes.BOT_REGISTRATION:
            await this.azureResourceManagementClient.deployBotResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname, // come back to this!
              displayName: config.hostname, // todo: this may be wrong!
              endpoint: `https://${provisionResults.webApp.hostname}/api/messages`,
              appId: provisionResults.appId,
            });
            break;

          case AzureResourceTypes.AZUREFUNCTIONS:
            // TODO
            break;
          case AzureResourceTypes.COSMODB:
            provisionResults.cosmoDB = await this.azureResourceManagementClient.deployCosmosDBResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: config.hostname.replace(/_/g, '').substr(0, 31).toLowerCase(),
              databaseName: `botstate-db`,
              containerName: `botstate-container`,
            });
            break;
          case AzureResourceTypes.APPINSIGHTS:
            break;
          case AzureResourceTypes.LUIS_AUTHORING:
            provisionResults.luisAuthoring = await this.azureResourceManagementClient.deployLuisAuthoringResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              accountName: `${config.hostname}-luis-authoring`,
            });
            break;
          case AzureResourceTypes.LUIS_PREDICTION:
            // eslint-disable-next-line no-case-declarations
            provisionResults.luisPrediction = await this.azureResourceManagementClient.deployLuisResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              accountName: `${config.hostname}-luis`,
            });
            break;
          case AzureResourceTypes.BLOBSTORAGE:
            // eslint-disable-next-line no-case-declarations
            const storageAccountName = config.hostname.toLowerCase().replace(/-/g, '').replace(/_/g, '');
            console.log('STORAGE ACCOUNT NAME IS ', storageAccountName);
            provisionResults.blobStorage = await this.azureResourceManagementClient.deployBlobStorageResource({
              resourceGroupName: resourceGroupName,
              location: provisionResults.resourceGroup.location,
              name: storageAccountName,
              containerName: 'transcripts',
            });
          break;
        }
      }

      console.log('PROVISION COMPLETE', provisionResults);

      return provisionResults;

      // // timestamp will be used as deployment name
      // const timeStamp = new Date().getTime().toString();

      // // START THE DEPLOY!
      // await this.azureResourceManagementClient.deployResources();

      // // If application insights created, update the application insights settings in azure bot service
      // if (createAppInsights) {
      //   this.logger({
      //     status: BotProjectDeployLoggerType.PROVISION_INFO,
      //     message: `> Linking Application Insights settings to Bot Service ...`,
      //   });

      //   const appinsightsClient = new ApplicationInsightsManagementClient(tokenCredentials, this.subscriptionId);
      //   const appComponents = await appinsightsClient.components.get(resourceGroupName, resourceGroupName);
      //   const appinsightsId = appComponents.appId;
      //   const appinsightsInstrumentationKey = appComponents.instrumentationKey;
      //   const apiKeyOptions = {
      //     name: `${resourceGroupName}-provision-${timeStamp}`,
      //     linkedReadProperties: [
      //       `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/api`,
      //       `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/agentconfig`,
      //     ],
      //     linkedWriteProperties: [
      //       `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}/providers/microsoft.insights/components/${resourceGroupName}/annotations`,
      //     ],
      //   };
      //   const appinsightsApiKeyResponse = await appinsightsClient.aPIKeys.create(
      //     resourceGroupName,
      //     resourceGroupName,
      //     apiKeyOptions
      //   );
      //   const appinsightsApiKey = appinsightsApiKeyResponse.apiKey;

      //   this.logger({
      //     status: BotProjectDeployLoggerType.PROVISION_INFO,
      //     message: `> AppInsights AppId: ${appinsightsId} ...`,
      //   });
      //   this.logger({
      //     status: BotProjectDeployLoggerType.PROVISION_INFO,
      //     message: `> AppInsights InstrumentationKey: ${appinsightsInstrumentationKey} ...`,
      //   });
      //   this.logger({
      //     status: BotProjectDeployLoggerType.PROVISION_INFO,
      //     message: `> AppInsights ApiKey: ${appinsightsApiKey} ...`,
      //   });

      //   if (appinsightsId && appinsightsInstrumentationKey && appinsightsApiKey) {
      //     const botServiceClient = new AzureBotService(tokenCredentials, this.subscriptionId);
      //     const botCreated = await botServiceClient.bots.get(resourceGroupName, hostname);
      //     if (botCreated.properties) {
      //       botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
      //       botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
      //       botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
      //       const botUpdateResult = await botServiceClient.bots.update(resourceGroupName, hostname, botCreated);

      //       if (botUpdateResult._response.status != 200) {
      //         this.logger({
      //           status: BotProjectDeployLoggerType.PROVISION_ERROR,
      //           message: `! Something went wrong while trying to link Application Insights settings to Bot Service Result: ${JSON.stringify(
      //             botUpdateResult
      //           )}`,
      //         });
      //         throw new Error(`Linking Application Insights Failed.`);
      //       }
      //       this.logger({
      //         status: BotProjectDeployLoggerType.PROVISION_INFO,
      //         message: `> Linking Application Insights settings to Bot Service Success!`,
      //       });
      //     } else {
      //       this.logger({
      //         status: BotProjectDeployLoggerType.PROVISION_WARNING,
      //         message: `! The Bot doesn't have a keys properties to update.`,
      //       });
      //     }
      //   }
      // }
      // const output = this.azureResourceManagementClient.getOutput();
      // const applicationOutput = {
      //   MicrosoftAppId: appId,
      //   MicrosoftAppPassword: appPassword,
      // };
      // Object.assign(output, applicationOutput);

      // this.logger({
      //   status: BotProjectDeployLoggerType.PROVISION_INFO,
      //   message: output,
      // });

      // const provisionResult = {} as any;

      // provisionResult.settings = output;
      // provisionResult.hostname = hostname;
      // if (createLuisResource) {
      //   provisionResult.luisResource = `${hostname}-luis`;
      // } else {
      //   provisionResult.luisResource = '';
      // }

      // return provisionResult;
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
