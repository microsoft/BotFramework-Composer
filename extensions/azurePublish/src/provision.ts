// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { ResourceManagementClient } from '@azure/arm-resources';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';
import {
  Deployment,
  DeploymentsCreateOrUpdateResponse,
  DeploymentsValidateResponse,
  ResourceGroup,
  ResourceGroupsCreateOrUpdateResponse,
} from '@azure/arm-resources/esm/models';
import { GraphRbacManagementClient } from '@azure/graph';
import { DeviceTokenCredentials } from '@azure/ms-rest-nodeauth';
import * as fs from 'fs-extra';
import * as rp from 'request-promise';

import { BotProjectDeployConfig } from './botProjectDeployConfig';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';

export class BotProjectProvision {
  private subId: string;
  private accessToken: string;
  private creds: any; // credential from interactive login
  private projPath: string;
  private templatePath: string;
  private logger: (string) => any;

  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.creds = config.creds;
    this.projPath = config.projPath;

    // path to the ARM template
    // this is currently expected to live in the code project
    this.templatePath =
      config.templatePath ?? path.join(this.projPath, 'DeploymentTemplates', 'template-with-preexisting-rg.json');
  }

  /*******************************************************************************************************************************/
  /* This section has to do with creating new Azure resources
  /*******************************************************************************************************************************/

  /**
   * Write updated settings back to the settings file
   */
  private async updateDeploymentJsonFile(
    client: ResourceManagementClient,
    resourceGroupName: string,
    deployName: string,
    appId: string,
    appPwd: string
  ): Promise<any> {
    const outputs = await client.deployments.get(resourceGroupName, deployName);
    if (outputs?.properties?.outputs) {
      const outputResult = outputs.properties.outputs;
      const applicationResult = {
        MicrosoftAppId: appId,
        MicrosoftAppPassword: appPwd,
      };
      const outputObj = this.unpackObject(outputResult);

      const result = {};
      Object.assign(result, outputObj, applicationResult);
      return result;
    } else {
      return null;
    }
  }

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

  private pack(scope: any) {
    return {
      value: scope,
    };
  }

  private unpackObject(output: any) {
    const unpacked: any = {};
    for (const key in output) {
      const objValue = output[key];
      if (objValue.value) {
        unpacked[key] = objValue.value;
      }
    }
    return unpacked;
  }

  /**
   * Format the parameters
   */
  private getDeploymentTemplateParam(
    appId: string,
    appPwd: string,
    location: string,
    name: string,
    shouldCreateAuthoringResource: boolean,
    shouldCreateLuisResource: boolean,
    useAppInsights: boolean,
    useCosmosDb: boolean,
    useStorage: boolean
  ) {
    return {
      appId: this.pack(appId),
      appSecret: this.pack(appPwd),
      appServicePlanLocation: this.pack(location),
      botId: this.pack(name),
      shouldCreateAuthoringResource: this.pack(shouldCreateAuthoringResource),
      shouldCreateLuisResource: this.pack(shouldCreateLuisResource),
      useAppInsights: this.pack(useAppInsights),
      useCosmosDb: this.pack(useCosmosDb),
      useStorage: this.pack(useStorage),
    };
  }

  private async readTemplateFile(templatePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  /***********************************************************************************************
   * Azure API accessors
   **********************************************************************************************/

  /**
   * Use the Azure API to create a new resource group
   */
  private async createResourceGroup(
    client: ResourceManagementClient,
    location: string,
    resourceGroupName: string
  ): Promise<ResourceGroupsCreateOrUpdateResponse> {
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Creating resource group ...`,
    });
    const param = {
      location: location,
    } as ResourceGroup;

    return await client.resourceGroups.createOrUpdate(resourceGroupName, param);
  }

  /**
   * Validate the deployment using the Azure API
   */
  private async validateDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsValidateResponse> {
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: '> Validating Azure deployment ...',
    });
    const templateFile = await this.readTemplateFile(templatePath);
    const deployParam = {
      properties: {
        template: JSON.parse(templateFile),
        parameters: templateParam,
        mode: 'Incremental',
      },
    } as Deployment;
    return await client.deployments.validate(resourceGroupName, deployName, deployParam);
  }

  /**
   * Using an ARM template, provision a bunch of resources
   */
  private async createDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsCreateOrUpdateResponse> {
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: `> Deploying Azure services (this could take a while)...`,
    });
    const templateFile = await this.readTemplateFile(templatePath);
    const deployParam = {
      properties: {
        template: JSON.parse(templateFile),
        parameters: templateParam,
        mode: 'Incremental',
      },
    } as Deployment;

    return await client.deployments.createOrUpdate(resourceGroupName, deployName, deployParam);
  }

  private async createApp(graphClient: GraphRbacManagementClient, displayName: string, appPassword: string) {
    const createRes = await graphClient.applications.create({
      displayName: displayName,
      passwordCredentials: [
        {
          value: appPassword,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
        },
      ],
      availableToOtherTenants: true,
      replyUrls: ['https://token.botframework.com/.auth/web/redirect'],
    });
    return createRes;
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
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    createLuisResource = true,
    createLuisAuthoringResource = true,
    createCosmosDb = true,
    createStorage = true,
    createAppInsights = true
  ) {
    if (!this.tenantId) {
      this.tenantId = await this.getTenantId();
    }
    const graphCreds = new DeviceTokenCredentials(
      this.creds.clientId,
      this.tenantId,
      this.creds.username,
      'graph',
      this.creds.environment,
      this.creds.tokenCache
    );
    const graphClient = new GraphRbacManagementClient(graphCreds, this.tenantId, {
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
      const appCreated = await this.createApp(graphClient, name, appPassword);
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

    const resourceGroupName = `${name}-${environment}`;

    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();
    const client = new ResourceManagementClient(this.creds, this.subId);

    // Create a resource group to contain the new resources
    const rpres = await this.createResourceGroup(client, location, resourceGroupName);
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: rpres,
    });

    // Caste the parameters into the right format
    const deploymentTemplateParam = this.getDeploymentTemplateParam(
      appId,
      appPassword,
      location,
      name,
      createLuisAuthoringResource,
      createLuisResource,
      createAppInsights,
      createCosmosDb,
      createStorage
    );
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: deploymentTemplateParam,
    });

    // Validate the deployment using the Azure API
    const validation = await this.validateDeployment(
      client,
      this.templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: validation,
    });

    // Handle validation errors
    if (validation.error) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `! Template is not valid with provided parameters. Review the log for more information.`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `! Error: ${validation.error.message}`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR_DETAILS,
        message: validation.error.details,
      });

      throw new Error(`! Error: ${validation.error.message}`);
    }

    // Create the entire stack of resources inside the new resource group
    // this is controlled by an ARM template identified in this.templatePath
    const deployment = await this.createDeployment(
      client,
      this.templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: deployment,
    });

    // Handle errors
    // eslint-disable-next-line no-underscore-dangle
    if (deployment._response.status != 200) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `! Template is not valid with provided parameters. Review the log for more information.`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `! Error: ${validation.error}`,
      });
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_ERROR,
        message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
      });

      throw new Error(`! Error: ${validation.error}`);
    }

    // If application insights created, update the application insights settings in azure bot service
    if (createAppInsights) {
      this.logger({
        status: BotProjectDeployLoggerType.PROVISION_INFO,
        message: `> Linking Application Insights settings to Bot Service ...`,
      });

      const appinsightsClient = new ApplicationInsightsManagementClient(this.creds, this.subId);
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
        const botServiceClient = new AzureBotService(this.creds, this.subId);
        const botCreated = await botServiceClient.bots.get(resourceGroupName, name);
        if (botCreated.properties) {
          botCreated.properties.developerAppInsightKey = appinsightsInstrumentationKey;
          botCreated.properties.developerAppInsightsApiKey = appinsightsApiKey;
          botCreated.properties.developerAppInsightsApplicationId = appinsightsId;
          const botUpdateResult = await botServiceClient.bots.update(resourceGroupName, name, botCreated);

          // eslint-disable-next-line no-underscore-dangle
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

    // Validate that everything was successfully created.
    // Then, update the settings file with information about the new resources
    const updateResult = await this.updateDeploymentJsonFile(client, resourceGroupName, timeStamp, appId, appPassword);
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_INFO,
      message: updateResult,
    });

    // Handle errors
    if (!updateResult) {
      const operations = await client.deploymentOperations.list(resourceGroupName, timeStamp);
      if (operations) {
        const failedOperations = operations.filter((value) => value?.properties?.statusMessage.error !== null);
        if (failedOperations) {
          failedOperations.forEach((operation) => {
            switch (operation?.properties?.statusMessage.error.code) {
              case 'MissingRegistrationForLocation':
                this.logger({
                  status: BotProjectDeployLoggerType.PROVISION_ERROR,
                  message: `! Deployment failed for resource of type ${operation?.properties?.targetResource?.resourceType}. This resource is not avaliable in the location provided.`,
                });
                break;
              default:
                this.logger({
                  status: BotProjectDeployLoggerType.PROVISION_ERROR,
                  message: `! Deployment failed for resource of type ${operation?.properties?.targetResource?.resourceType}.`,
                });
                this.logger({
                  status: BotProjectDeployLoggerType.PROVISION_ERROR,
                  message: `! Code: ${operation?.properties?.statusMessage.error.code}.`,
                });
                this.logger({
                  status: BotProjectDeployLoggerType.PROVISION_ERROR,
                  message: `! Message: ${operation?.properties?.statusMessage.error.message}.`,
                });
                break;
            }
          });
        }
      } else {
        this.logger({
          status: BotProjectDeployLoggerType.PROVISION_ERROR,
          message: `! Deployment failed. Please refer to the log file for more information.`,
        });
      }
    }
    this.logger({
      status: BotProjectDeployLoggerType.PROVISION_SUCCESS,
      message: `+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`,
    });
    return updateResult;
  }
}
