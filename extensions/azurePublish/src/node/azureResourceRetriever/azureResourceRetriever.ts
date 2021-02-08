// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CognitiveServicesManagementClient } from "@azure/arm-cognitiveservices";
import { AzureResourceRetrieverConfig } from "./azureResourceRetrieverConfig";
import { AzureResourceRetrieverLoggerType } from "./azureResourceRetrieverLoggerType";
import * as rp from 'request-promise';
import { AzureBotService } from "@azure/arm-botservice";
import { AzureResourceRetrieverErrors } from "./azureResourceRetrieverErrors";
import { createCustomizeError, stringifyError } from "../utils/errorHandler";
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { ApplicationInsightsManagementClient } from "@azure/arm-appinsights";
import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";
import { StorageManagementClient } from "@azure/arm-storage";

export class AzureResourceRetriever {
  // Logger
  private logger: any;

  // Credentials
  private creds: any;

  // Subscription id
  private subscriptionId: string;

  constructor(config: AzureResourceRetrieverConfig) {
    this.logger = config.logger;
    this.creds = config.creds;
    this.subscriptionId = config.subscriptionId;
  }

  public async SelectExistingLuisAuthoringAccount(resourceGroupName: string, accountName: string) {
    const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);

    const account = await cognitiveServicesManagementClient.accounts.getProperties(resourceGroupName, accountName);
    const authoringEndpoint = account._response.parsedBody.properties.endpoint;

    const keys = await cognitiveServicesManagementClient.accounts.listKeys(
      resourceGroupName,
      accountName
    );
    const authoringKey = keys?.key1 ?? '';
    return { authoringKey, authoringEndpoint };
  }

  public async SelectExistingLuisPredictionAccount(resourceGroupName: string, accountName: string) {
    const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);

    const account = await cognitiveServicesManagementClient.accounts.getProperties(resourceGroupName, accountName);
    const endpoint = account._response.parsedBody.properties.endpoint;

    const keys = await cognitiveServicesManagementClient.accounts.listKeys(
      resourceGroupName,
      accountName
    );
    const endpointKey = keys?.key1 ?? '';
    return { endpointKey, endpoint };
  }

  /**
   * Get ms app id based on the bot channel registration
   * @param resourceGroupName
   * @param botName
   */
  public async SelectExistingBotChannelRegistration(resourceGroupName: string, botName: string) {
    try {
      this.logger({
        status: AzureResourceRetrieverLoggerType.INFO,
        message: 'Getting Bot Resource ...',
      });
      const azureBotSerivce = new AzureBotService(this.creds, this.subscriptionId);

      const botResult = await azureBotSerivce.bots.get(resourceGroupName, botName);

      if (botResult?._response?.status >= 300) {
        this.logger({
          status: AzureResourceRetrieverLoggerType.INFO,
          message: botResult._response?.bodyAsText,
        });
        throw createCustomizeError(AzureResourceRetrieverErrors.BOT_CHANNEL_REGISTRATION_ERROR, botResult._response?.bodyAsText);
      }

      return {
        MicrosoftAppId: botResult._response.parsedBody.properties.msaAppId
      };
    } catch (err) {
      this.logger({
        status: AzureResourceRetrieverLoggerType.ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(AzureResourceRetrieverErrors.BOT_CHANNEL_REGISTRATION_ERROR, stringifyError(err));
    }
  }

  public async SelectExistingCosmosDB(resourceGroupName: string, dbName: string) {
    try {
      this.logger({
        status: AzureResourceRetrieverLoggerType.INFO,
        message: 'Deploying Cosmos DB Resource ...',
      });

      // get DB accounts
      const cosmosDBManagementClient = new CosmosDBManagementClient(this.creds, this.subscriptionId);
      const dbAccountGetResult = await cosmosDBManagementClient.databaseAccounts.get(
        resourceGroupName,
        dbName
      );

      if (dbAccountGetResult._response.status >= 300) {
        this.logger({
          status: AzureResourceRetrieverErrors.COSMOS_DB_ERROR,
          message: dbAccountGetResult._response.bodyAsText,
        });
        throw createCustomizeError(AzureResourceRetrieverErrors.COSMOS_DB_ERROR, dbAccountGetResult._response.bodyAsText);
      }

      const authKeyResult = await cosmosDBManagementClient.databaseAccounts.listKeys(
        resourceGroupName,
        dbName
      );
      if (authKeyResult._response.status >= 300) {
        this.logger({
          status: AzureResourceRetrieverErrors.COSMOS_DB_ERROR,
          message: authKeyResult._response.bodyAsText,
        });
        throw createCustomizeError(AzureResourceRetrieverErrors.COSMOS_DB_ERROR, authKeyResult._response.bodyAsText);
      }

      const authKey = authKeyResult.primaryMasterKey;
      const cosmosDBEndpoint = dbAccountGetResult.documentEndpoint;

      return {
        authKey,
        cosmosDBEndpoint,
        databaseId: 'botstate-db',
        containerId: 'botstate-container',
      };
    } catch (err) {
      this.logger({
        status: AzureResourceRetrieverErrors.COSMOS_DB_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(AzureResourceRetrieverErrors.COSMOS_DB_ERROR, stringifyError(err));
    }
  }

  public async SelectExistingBlobStorage(resourceGroupName: string, storageName: string) {
    try {
      this.logger({
        status: AzureResourceRetrieverLoggerType.INFO,
        message: 'Getting Blob Storage Resource ...',
      });
      const storageManagementClient = new StorageManagementClient(this.creds, this.subscriptionId);

      const deployResult = await storageManagementClient.storageAccounts.getProperties(resourceGroupName, storageName);
      if (deployResult._response.status >= 300) {
        this.logger({
          status: AzureResourceRetrieverErrors.BLOB_STORAGE_ERROR,
          message: deployResult._response.bodyAsText,
        });
        throw createCustomizeError(AzureResourceRetrieverErrors.BLOB_STORAGE_ERROR, deployResult._response.bodyAsText);
      }

      const accountKeysResult = await storageManagementClient.storageAccounts.listKeys(
        resourceGroupName,
        storageName
      );
      const connectionString = accountKeysResult?.keys?.[0].value ?? '';

      return { name: storageName, connectionString, container: 'transcripts' };
    } catch (err) {
      this.logger({
        status: AzureResourceRetrieverErrors.BLOB_STORAGE_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(AzureResourceRetrieverErrors.BLOB_STORAGE_ERROR, stringifyError(err));
    }
  }

  public async SelectExistingApplicationInsights(resourceGroupName: string, insightsName: string) {
    try {
      this.logger({
        status: AzureResourceRetrieverLoggerType.INFO,
        message: 'Getting Application Insights Resource ...',
      });
      const applicationInsightsManagementClient = new ApplicationInsightsManagementClient(
        this.creds,
        this.subscriptionId
      );
      const getResult = await applicationInsightsManagementClient.components.get(
        resourceGroupName,
        insightsName
      );
      if (getResult._response.status >= 300) {
        this.logger({
          status: AzureResourceRetrieverLoggerType.ERROR,
          message: getResult._response.bodyAsText,
        });
        throw createCustomizeError(AzureResourceRetrieverErrors.APPLICATION_INSIGHTS_ERROR, getResult._response.bodyAsText);
      }

      // Update output and status
      return {
        instrumentationKey: getResult.instrumentationKey,
      };
    } catch (err) {
      this.logger({
        status: AzureResourceRetrieverErrors.APPLICATION_INSIGHTS_ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(AzureResourceRetrieverErrors.APPLICATION_INSIGHTS_ERROR, stringifyError(err));
    }
  }

  public async SelectExistingQnaAccount(resourceGroupName: string, webAppName: string, accountName: string) {
    try {
      this.logger({
        status: AzureResourceRetrieverLoggerType.INFO,
        message: 'Getting Qna Account ...',
      });
      const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(this.creds, this.subscriptionId);
      const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);

      const webAppResult = await webSiteManagementClient.webApps.get(resourceGroupName, webAppName);
      const endpoint = webAppResult.hostNames?.[0];
      const keys = await cognitiveServicesManagementClient.accounts.listKeys(
        resourceGroupName,
        accountName
      );
      const subscriptionKey = keys?.key1 ?? '';
      return {
        endpoint: endpoint,
        subscriptionKey: subscriptionKey
      };
    }
    catch (err) {
      this.logger({
        status: AzureResourceRetrieverLoggerType.ERROR,
        message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      throw createCustomizeError(AzureResourceRetrieverErrors.QNA_ACCOUNT_ERROR, stringifyError(err));
    }
  }
}