// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */

import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { StorageManagementClient } from '@azure/arm-storage';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { AzureBotService } from '@azure/arm-botservice';
import { ResourceManagementClient } from '@azure/arm-resources';
import { CosmosDBManagementClient } from '@azure/arm-cosmosdb';
import { SearchManagementClient } from '@azure/arm-search';

import { BotProjectDeployLoggerType } from '../types';
import { createCustomizeError, ProvisionErrors, stringifyError } from '../utils/errorHandler';
import { LuisAuthoringSupportLocation } from '../../types';

import {
  AzureResourceManangerConfig,
  CosmosDBConfig,
  LuisAuthoringResourceConfig,
  LuisResourceConfig,
  ApplicationInsightsConfig,
  BlobStorageConfig,
  WebAppConfig,
  BotConfig,
  ResourceGroupConfig,
  DeploymentsConfig,
  QnAResourceConfig,
  AzureFunctionsConfig,
} from './azureResourceManagerConfig';

export class AzureResourceMananger {
  // Logger
  private logger: any;

  // Credentials
  private creds: any;

  // Subscription id
  private subscriptionId: string;

  constructor(config: AzureResourceManangerConfig) {
    this.logger = config.logger;
    this.creds = config.creds;
    this.subscriptionId = config.subscriptionId;
  }

  /**
   * Create resource group
   * @param config
   */
  public async createResourceGroup(config: ResourceGroupConfig): Promise<ResourceGroupConfig> {
    if (!config.name) {
      throw createCustomizeError(
        ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
        'You should provide a valid resource group name.'
      );
    }
    // Create a new resource group
    if (!config.location) {
      throw createCustomizeError(
        ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
        'You should provide a valid resource group name.'
      );
    }

    try {
      const resourceManagementClient = new ResourceManagementClient(this.creds, this.subscriptionId);

      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Checking the Existence of the Resource Group ...',
      });

      const validateExist = await resourceManagementClient.resourceGroups.checkExistence(config.name);

      // IF A RESOURCE GROUP EXISTS, USE THIS ONE!
      if (validateExist.body) {
        // Already Exists a resource group with the provided name
        const resourceGroupGetResult = await resourceManagementClient.resourceGroups.get(config.name);
        if (resourceGroupGetResult._response.status >= 300) {
          // Something went wrong at resource group get
          this.logger({
            status: BotProjectDeployLoggerType.PROVISION_ERROR,
            message: resourceGroupGetResult._response.bodyAsText,
          });
          throw createCustomizeError(
            ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
            resourceGroupGetResult._response.bodyAsText
          );
        }

        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_INFO,
          message: `Use the Resource Group: ${config.name} at ${resourceGroupGetResult.location}`,
        });

        // If the resource group exists, use the existing location property
        return {
          name: config.name,
          location: resourceGroupGetResult.location,
        };
      } else {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_INFO,
          message: 'Creating Resource Group ...',
        });

        const resourceGroupResult = await resourceManagementClient.resourceGroups.createOrUpdate(config.name, {
          location: config.location,
        });

        if (resourceGroupResult._response.status >= 300) {
          throw createCustomizeError(
            ProvisionErrors.CREATE_RESOURCEGROUP_ERROR,
            resourceGroupResult._response.bodyAsText
          );
        }

        return config;
      }
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_RESOURCEGROUP_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy luis authoring resource
   * @param config
   */
  public async deployLuisAuthoringResource(config: LuisAuthoringResourceConfig) {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Luis Authoring Resource ...',
      });
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);
      // check location is validated
      let authoringLocation = config.location;
      if (!LuisAuthoringSupportLocation.includes(config.location)) {
        authoringLocation = 'westus'; // default as westus
      }
      const deployResult = await cognitiveServicesManagementClient.accounts.create(
        config.resourceGroupName,
        config.name,
        {
          kind: 'LUIS.Authoring',
          sku: {
            name: config.sku ?? 'F0',
          },
          location: authoringLocation,
        }
      );
      if (deployResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(
          ProvisionErrors.CREATE_LUIS_AUTHORING_RESOURCE_ERROR,
          deployResult._response.bodyAsText
        );
      }

      const authoringEndpoint = deployResult.properties?.endpoint ?? '';
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(config.resourceGroupName, config.name);
      const authoringKey = keys?.key1 ?? '';
      return { authoringKey, authoringEndpoint };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_LUIS_AUTHORING_RESOURCE_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy luis resource
   * @param config
   */
  public async deployLuisResource(config: LuisResourceConfig): Promise<{ endpoint: string; endpointKey: string }> {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Luis Resource ...',
      });
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);
      // check luis publish location is validated
      let authoringLocation = config.location;
      if (!LuisAuthoringSupportLocation.includes(config.location)) {
        authoringLocation = 'westus'; // default as westus
      }
      const deployResult = await cognitiveServicesManagementClient.accounts.create(
        config.resourceGroupName,
        config.name,
        {
          kind: 'LUIS',
          sku: {
            name: config.sku ?? 'S0',
          },
          location: authoringLocation,
        }
      );
      if (deployResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_LUIS_ERROR, deployResult._response.bodyAsText);
      }

      const endpoint = deployResult.properties?.endpoint ?? '';
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(config.resourceGroupName, config.name);
      const endpointKey = keys?.key1 ?? '';
      return { endpoint, endpointKey };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_LUIS_ERROR, stringifyError(err));
    }
  }

  /**
   * QnA Resource depends on serveral components, including appinights and web config
   * @param config
   */
  public async deployQnAReource(config: QnAResourceConfig): Promise<{ endpoint: string; subscriptionKey: string }> {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying QnA Resource ...',
      });

      // initialize the name
      const qnaMakerSearchName = `${config.name}-search`.toLowerCase().replace('_', '');
      const qnaMakerWebAppName = `${config.name}-qnahost`.toLowerCase().replace('_', '');
      const qnaMakerServiceName = `${config.name}-qna`;

      // only support westus in qna
      if (config.location !== 'westus') {
        config.location = 'westus';
      }

      // deploy search service
      const searchManagementClient = new SearchManagementClient(this.creds, this.subscriptionId);
      const searchServiceDeployResult = await searchManagementClient.services.createOrUpdate(
        config.resourceGroupName,
        qnaMakerSearchName,
        {
          location: config.location,
          sku: {
            name: 'standard',
          },
          replicaCount: 1,
          partitionCount: 1,
          hostingMode: 'default',
        }
      );

      if (searchServiceDeployResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: searchServiceDeployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, searchServiceDeployResult._response.bodyAsText);
      }

      // deploy websites
      // Create new Service Plan or update the exisiting service plan created before
      const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
      const servicePlanName = config.resourceGroupName;
      const servicePlanResult = await webSiteManagementClient.appServicePlans.createOrUpdate(
        config.resourceGroupName,
        servicePlanName,
        {
          location: config.location,
          sku: {
            name: 'S1',
            tier: 'Standard',
            size: 'S1',
            family: 'S',
            capacity: 1,
          },
        }
      );

      if (servicePlanResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: servicePlanResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, servicePlanResult._response.bodyAsText);
      }

      // deploy or update exisiting app insights component
      const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
        this.creds,
        this.subscriptionId
      );
      const appinsightsName = config.resourceGroupName;
      const appinsightsDeployResult = await applicationInsightsManagementClient.components.createOrUpdate(
        config.resourceGroupName,
        appinsightsName,
        {
          location: config.location,
          applicationType: 'web',
          kind: 'web',
        }
      );
      if (appinsightsDeployResult._response.status >= 300 || appinsightsDeployResult.provisioningState != 'Succeeded') {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: appinsightsDeployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, appinsightsDeployResult._response.bodyAsText);
      }

      // deploy qna host webapp
      const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(
        config.resourceGroupName,
        qnaMakerWebAppName,
        {
          name: qnaMakerWebAppName,
          serverFarmId: servicePlanResult.name,
          location: config.location,
          siteConfig: {
            cors: {
              allowedOrigins: ['*'],
            },
          },
          enabled: true,
        }
      );

      if (webAppResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: webAppResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, webAppResult._response.bodyAsText);
      }

      // add web config for websites
      const azureSearchAdminKey = (
        await searchManagementClient.adminKeys.get(config.resourceGroupName, qnaMakerSearchName)
      ).primaryKey;
      const appInsightsComponent = await applicationInsightsManagementClient.components.get(
        config.resourceGroupName,
        appinsightsName
      );
      const userAppInsightsKey = appInsightsComponent.instrumentationKey;
      const userAppInsightsName = appinsightsName;
      const userAppInsightsAppId = appInsightsComponent.appId;
      const primaryEndpointKey = `${qnaMakerWebAppName}-PrimaryEndpointKey`;
      const secondaryEndpointKey = `${qnaMakerWebAppName}-SecondaryEndpointKey`;
      const defaultAnswer = 'No good match found in KB.';
      const QNAMAKER_EXTENSION_VERSION = 'latest';

      const webAppConfigUpdateResult = await webSiteManagementClient.webApps.createOrUpdateConfiguration(
        config.resourceGroupName,
        qnaMakerWebAppName,
        {
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
        }
      );
      if (webAppConfigUpdateResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: webAppConfigUpdateResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, webAppConfigUpdateResult._response.bodyAsText);
      }

      // Create qna account
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);
      const deployResult = await cognitiveServicesManagementClient.accounts.create(
        config.resourceGroupName,
        qnaMakerServiceName,
        {
          kind: 'QnAMaker',
          sku: {
            name: config.sku ?? 'S0',
          },
          location: config.location,
          properties: {
            apiProperties: {
              qnaRuntimeEndpoint: `https://${webAppResult.hostNames?.[0]}`,
            },
          },
        }
      );
      if (deployResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, deployResult._response.bodyAsText);
      }

      const endpoint = webAppResult.hostNames?.[0];
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(
        config.resourceGroupName,
        qnaMakerServiceName
      );
      const subscriptionKey = keys?.key1 ?? '';
      return {
        endpoint: endpoint,
        subscriptionKey: subscriptionKey,
      };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_QNA_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy application insights
   * @param config
   */
  public async deployAppInsightsResource(config: ApplicationInsightsConfig): Promise<{ instrumentationKey: string }> {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Application Insights Resource ...',
      });
      const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
        this.creds,
        this.subscriptionId
      );
      const deployResult = await applicationInsightsManagementClient.components.createOrUpdate(
        config.resourceGroupName,
        config.name,
        {
          location: config.location,
          applicationType: config.applicationType ?? 'web',
          kind: 'web',
        }
      );
      if (deployResult._response.status >= 300 || deployResult.provisioningState != 'Succeeded') {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_APP_INSIGHT_ERROR, deployResult._response.bodyAsText);
      }

      // Update output and status
      return {
        instrumentationKey: deployResult.instrumentationKey,
      };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_APP_INSIGHT_ERROR, stringifyError(err));
    }
  }

  public async connectAppInsightsToBotService(config: any) {
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Linking Application Insights settings to Bot Service ...`,
    });
    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();

    const appinsightsClient = new ApplicationInsightsManagementClient(this.creds, this.subscriptionId);
    const appComponents = await appinsightsClient.components.get(config.resourceGroupName, config.name);
    const appinsightsId = appComponents.appId;
    const appinsightsInstrumentationKey = appComponents.instrumentationKey;
    const apiKeyOptions = {
      name: `${config.resourceGroupName}-provision-${timeStamp}`,
      linkedReadProperties: [
        `/subscriptions/${this.subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/api`,
        `/subscriptions/${this.subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/agentconfig`,
      ],
      linkedWriteProperties: [
        `/subscriptions/${this.subscriptionId}/resourceGroups/${config.resourceGroupName}/providers/microsoft.insights/components/${config.name}/annotations`,
      ],
    };

    let appinsightsApiKeyResponse;
    try {
      appinsightsApiKeyResponse = await appinsightsClient.aPIKeys.create(
        config.resourceGroupName,
        config.resourceGroupName,
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
        const botServiceClient = new AzureBotService(this.creds, this.subscriptionId);
        const botCreated = await botServiceClient.bots.get(config.resourceGroupName, config.name);
        if (botCreated.properties) {
          botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
          botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
          botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
          let botUpdateResult;
          try {
            botUpdateResult = await botServiceClient.bots.update(config.resourceGroupName, config.name, botCreated);
          } catch (err) {
            this.logger({
              status: BotProjectDeployLoggerType.PROVISION_ERROR,
              message: `! Something went wrong while trying to link Application Insights settings to Bot Service Result: ${JSON.stringify(
                botUpdateResult
              )}`,
            });
            throw err;
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
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CONNECT_APP_INSIGHT_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy cosmos db
   * @param config
   */
  public async deployCosmosDBResource(config: CosmosDBConfig) {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Cosmos DB Resource ...',
      });

      // Create DB accounts
      const cosmosDBManagementClient = new CosmosDBManagementClient(this.creds, this.subscriptionId);
      const dbAccountDeployResult = await cosmosDBManagementClient.databaseAccounts.createOrUpdate(
        config.resourceGroupName,
        config.name,
        {
          location: config.location,
          locations: [
            {
              locationName: config.location,
              failoverPriority: 0,
            },
          ],
        }
      );

      if (dbAccountDeployResult._response.status >= 300 || dbAccountDeployResult.provisioningState != 'Succeeded') {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: dbAccountDeployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, dbAccountDeployResult._response.bodyAsText);
      }

      // Create DB
      const dbDeployResult = await cosmosDBManagementClient.sqlResources.createUpdateSqlDatabase(
        config.resourceGroupName,
        config.name,
        config.databaseName,
        {
          resource: {
            id: config.databaseName,
          },
          options: {},
        }
      );

      if (dbDeployResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: dbDeployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, dbDeployResult._response.bodyAsText);
      }

      // Create Container
      const containerCreateResult = await cosmosDBManagementClient.sqlResources.createUpdateSqlContainer(
        config.resourceGroupName,
        config.name,
        config.databaseName,
        config.containerName,
        {
          resource: {
            id: config.containerName,
            indexingPolicy: {
              indexingMode: 'Consistent',
              automatic: true,
              includedPaths: [
                {
                  path: '/*',
                },
              ],
              excludedPaths: [
                {
                  path: '/"_etag"/?',
                },
              ],
            },
            partitionKey: {
              paths: ['/id'],
              kind: 'Hash',
            },
            conflictResolutionPolicy: {
              mode: 'LastWriterWins',
              conflictResolutionPath: '/_ts',
            },
          },
          options: {},
        }
      );

      if (containerCreateResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: containerCreateResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, containerCreateResult._response.bodyAsText);
      }

      const authKeyResult = await cosmosDBManagementClient.databaseAccounts.listKeys(
        config.resourceGroupName,
        config.name
      );
      if (authKeyResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: authKeyResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, authKeyResult._response.bodyAsText);
      }

      const authKey = authKeyResult.primaryMasterKey;
      const cosmosDBEndpoint = dbAccountDeployResult.documentEndpoint;

      return {
        authKey,
        cosmosDBEndpoint,
        databaseId: config.databaseName,
        containerId: config.containerName,
        collectionId: 'botstate-collection',
      };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_COSMOSDB_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy blob storage
   * @param config
   */
  public async deployBlobStorageResource(
    config: BlobStorageConfig
  ): Promise<{ name: string; connectionString: string; container: string }> {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Blob Storage Resource ...',
      });
      const storageManagementClient = new StorageManagementClient(this.creds, this.subscriptionId);

      const deployResult = await storageManagementClient.storageAccounts.create(config.resourceGroupName, config.name, {
        location: config.location,
        kind: 'StorageV2',
        sku: {
          name: config.sku ?? 'Standard_LRS',
        },
      });
      if (deployResult._response.status >= 300 || deployResult.provisioningState != 'Succeeded') {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_BLOB_STORAGE_ERROR, deployResult._response.bodyAsText);
      }

      const accountKeysResult = await storageManagementClient.storageAccounts.listKeys(
        config.resourceGroupName,
        config.name
      );
      const connectionString = accountKeysResult?.keys?.[0].value ?? '';

      return { name: config.name, connectionString, container: config.containerName };
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_BLOB_STORAGE_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy web app
   * @param config
   */
  public async deployWebAppResource(config: WebAppConfig): Promise<string> {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Web App Resource ...',
      });
      const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);

      // Create new Service Plan
      const servicePlanResult = await webSiteManagementClient.appServicePlans.createOrUpdate(
        config.resourceGroupName,
        config.name,
        {
          location: config.location,
          sku: {
            name: 'S1',
            tier: 'Standard',
            size: 'S1',
            family: 'S',
            capacity: 1,
          },
        }
      );

      if (servicePlanResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: servicePlanResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_WEB_APP_ERROR, servicePlanResult._response.bodyAsText);
      }

      const webAppName = config.name;
      const webAppResult = await webSiteManagementClient.webApps.createOrUpdate(config.resourceGroupName, config.name, {
        name: webAppName,
        serverFarmId: servicePlanResult.name,
        location: config.location,
        kind: 'app',
        siteConfig: {
          appSettings: [
            {
              name: 'WEBSITE_NODE_DEFAULT_VERSION',
              value: '10.14.1',
            },
            {
              name: 'MicrosoftAppId',
              value: config.appId,
            },
            {
              name: 'MicrosoftAppPassword',
              value: config.appPwd,
            },
          ],
          cors: {
            allowedOrigins: ['https://botservice.hosting.portal.azure.net', 'https://hosting.onecloud.azure-test.net/'],
          },
        },
      });

      if (webAppResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: webAppResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_WEB_APP_ERROR, webAppResult._response.bodyAsText);
      }

      const siteHost = webAppResult?.hostNames?.[0];
      return siteHost;
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_WEB_APP_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy Azure Functions instance
   * @param config
   */
  public async deployAzureFunctions(config: AzureFunctionsConfig) {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Azure Functions Resource ...',
      });
      const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
      const azureFunctionsName = config.name;
      const azureFunctionsResult = await webSiteManagementClient.webApps.createOrUpdate(
        config.resourceGroupName,
        config.name,
        {
          name: azureFunctionsName,
          location: config.location,
          kind: 'functionapp',
          httpsOnly: true,
          siteConfig: {
            appSettings: [
              {
                name: 'MicrosoftAppId',
                value: config.appId,
              },
              {
                name: 'MicrosoftAppPassword',
                value: config.appPwd,
              },
              {
                name: 'FUNCTIONS_EXTENSION_VERSION',
                value: '~3',
              },
              {
                name: 'FUNCTIONS_WORKER_RUNTIME',
                value: 'dotnet',
              },
              {
                name: 'APPINSIGHTS_INSTRUMENTATIONKEY',
                value: config.instrumentationKey ?? '',
              },
            ],
          },
        }
      );

      if (azureFunctionsResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: azureFunctionsResult._response.bodyAsText,
        });
        throw createCustomizeError(
          ProvisionErrors.CREATE_FUNCTIONS_RESOURCE_ERROR,
          azureFunctionsResult._response.bodyAsText
        );
      }

      const siteHost = azureFunctionsResult?.hostNames?.[0];
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Azure Functions Success',
      });
      return siteHost;
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_FUNCTIONS_RESOURCE_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy bot channel registration
   * @param config
   */
  public async deployBotResource(config: BotConfig) {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Bot Resource ...',
      });
      const azureBotSerivce = new AzureBotService(this.creds, this.subscriptionId);

      const botResult = await azureBotSerivce.bots.create(config.resourceGroupName, config.name, {
        properties: {
          displayName: config.displayName ?? config.name,
          endpoint: config.endpoint ?? '',
          msaAppId: config.appId ?? '',
        },
        sku: {
          name: 'F0',
        },
        name: config.name,
        location: 'global',
        kind: 'bot',
      });

      if (botResult?._response?.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: botResult._response?.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.BOT_REGISTRATION_ERROR, botResult._response?.bodyAsText);
      }
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.BOT_REGISTRATION_ERROR, stringifyError(err));
    }
  }

  /**
   * Deploy guid deployment counter, indicates how many deployments have been made
   * @param config
   */
  public async deployDeploymentCounter(config: DeploymentsConfig) {
    try {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: 'Deploying Deployments Counter ...',
      });

      const resourceClient = new ResourceManagementClient(this.creds, this.subscriptionId);

      const counterResult = await resourceClient.deployments.createOrUpdate(config.resourceGroupName, config.name, {
        properties: {
          mode: 'Incremental',
          template: {
            $schema: 'https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#',
            contentVersion: '1.0.0.0',
            resources: [],
          },
        },
      });

      if (counterResult._response.status >= 300) {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: counterResult._response.bodyAsText,
        });
        throw createCustomizeError(ProvisionErrors.CREATE_COUNTER_ERROR, counterResult._response.bodyAsText);
      }
    } catch (err) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(ProvisionErrors.CREATE_COUNTER_ERROR, stringifyError(err));
    }
  }
}
