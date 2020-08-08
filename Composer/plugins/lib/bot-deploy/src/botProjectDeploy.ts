// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import * as util from 'util';

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
import archiver = require('archiver');

const exec = util.promisify(require('child_process').exec);
const { promisify } = require('util');

const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const readdir = promisify(fs.readdir);

export class BotProjectDeploy {
  private subId: string;
  private accessToken: string;
  private creds: any; // credential from interactive login
  private projPath: string;
  private deploymentSettingsPath: string;
  private deployFilePath: string;
  private zipPath: string;
  private publishFolder: string;
  private settingsPath: string;
  private templatePath: string;
  private dotnetProjectPath: string;
  private generatedFolder: string;
  private remoteBotPath: string;
  private logger: (string) => any;

  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.creds = config.creds;
    this.projPath = config.projPath;

    // set path to .deployment file which points at the BotProject.csproj
    this.deployFilePath = config.deployFilePath ?? path.join(this.projPath, '.deployment');

    // path to the zipped assets
    this.zipPath = config.zipPath ?? path.join(this.projPath, 'code.zip');

    // path to the built, ready to deploy code assets
    this.publishFolder = config.publishFolder ?? path.join(this.projPath, 'bin', 'Release', 'netcoreapp3.1');

    // path to the source appsettings.deployment.json file
    this.settingsPath = config.settingsPath ?? path.join(this.projPath, 'appsettings.deployment.json');

    // path to the deployed settings file that contains additional luis information
    this.deploymentSettingsPath =
      config.deploymentSettingsPath ?? path.join(this.publishFolder, 'appsettings.deployment.json');

    // path to the ARM template
    // this is currently expected to live in the code project
    this.templatePath =
      config.templatePath ?? path.join(this.projPath, 'DeploymentTemplates', 'template-with-preexisting-rg.json');

    // path to the dotnet project file
    this.dotnetProjectPath =
      config.dotnetProjectPath ?? path.join(this.projPath, 'Microsoft.BotFramework.Composer.WebApp.csproj');

    // path to the built, ready to deploy declarative assets
    this.remoteBotPath = config.remoteBotPath ?? path.join(this.publishFolder, 'ComposerDialogs');

    // path to the ready to deploy generated folder
    this.generatedFolder = config.generatedFolder ?? path.join(this.remoteBotPath, 'generated');
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

  private async getFiles(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFiles(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  private async botPrepareDeploy(pathToDeploymentFile: string) {
    return new Promise((resolve, reject) => {
      const data = `[config]\nproject = Microsoft.BotFramework.Composer.WebApp.csproj`;
      fs.writeFile(pathToDeploymentFile, data, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  private async dotnetPublish(publishFolder: string, projFolder: string, botPath?: string) {
    // perform the dotnet publish command
    // this builds the app and prepares it to be deployed
    // results in a built copy in publishFolder/
    await exec(`dotnet publish "${this.dotnetProjectPath}" -c release -o "${publishFolder}" -v q`);
    const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
    const localBotPath = path.join(projFolder, 'ComposerDialogs');
    // Then, copy the declarative assets into the build folder.
    if (botPath) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: `Publishing dialogs from external bot project: ${botPath}`,
      });
      await fs.copy(botPath, remoteBotPath, {
        overwrite: true,
        recursive: true,
      });
    } else {
      await fs.copy(localBotPath, remoteBotPath, {
        overwrite: true,
        recursive: true,
      });
    }
  }

  private async zipDirectory(source: string, out: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
      archive
        .directory(source, false)
        .on('error', (err) => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

  private notEmptyLuisModel(file: string) {
    return fs.readFileSync(file).length > 0;
  }

  // Run through the lubuild process
  // This happens in the build folder, NOT in the original source folder
  private async publishLuis(
    name: string,
    environment: string,
    language: string,
    luisEndpoint: string,
    luisAuthoringEndpoint: string,
    luisEndpointKey: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    luisResource?: string
  ) {
    if (luisAuthoringKey && luisAuthoringRegion) {
      // publishing luis
      const botFiles = await this.getFiles(this.remoteBotPath);
      const modelFiles = botFiles.filter((name) => {
        return name.endsWith('.lu') && this.notEmptyLuisModel(name);
      });

      if (!(await fs.pathExists(this.generatedFolder))) {
        await fs.mkdir(this.generatedFolder);
      }
      const builder = new luBuild.Builder((msg) =>
        this.logger({
          status: BotProjectDeployLoggerType.DEPLOY_INFO,
          message: msg,
        })
      );

      const loadResult = await builder.loadContents(
        modelFiles,
        language || '',
        environment || '',
        luisAuthoringRegion || ''
      );

      if (!luisEndpoint) {
        luisEndpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`;
      }

      if (!luisAuthoringEndpoint) {
        luisAuthoringEndpoint = luisEndpoint;
      }

      const buildResult = await builder.build(
        loadResult.luContents,
        loadResult.recognizers,
        luisAuthoringKey,
        luisAuthoringEndpoint,
        name,
        environment,
        language,
        true,
        false,
        loadResult.multiRecognizers,
        loadResult.settings
      );
      await builder.writeDialogAssets(buildResult, true, this.generatedFolder);

      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: `lubuild succeed`,
      });

      const luisConfigFiles = (await this.getFiles(this.remoteBotPath)).filter((filename) =>
        filename.includes('luis.settings')
      );
      const luisAppIds: any = {};

      for (const luisConfigFile of luisConfigFiles) {
        const luisSettings = await fs.readJson(luisConfigFile);
        Object.assign(luisAppIds, luisSettings.luis);
      }

      const luisConfig: any = {
        endpoint: luisEndpoint,
        endpointKey: luisEndpointKey,
        authoringRegion: luisAuthoringRegion,
        authoringKey: luisAuthoringRegion,
      };

      Object.assign(luisConfig, luisAppIds);

      // Update deploymentSettings with the luis config
      const settings: any = await fs.readJson(this.deploymentSettingsPath);
      settings.luis = luisConfig;

      await fs.writeJson(this.deploymentSettingsPath, settings, {
        spaces: 4,
      });

      let jsonRes;
      try {
        // Assign a LUIS key to the endpoint of each app
        const getAccountUri = `${luisEndpoint}/luis/api/v2.0/azureaccounts`;
        const options = {
          headers: { Authorization: `Bearer ${this.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
        } as rp.RequestPromiseOptions;
        const response = await rp.get(getAccountUri, options);
        jsonRes = JSON.parse(response);
      } catch (err) {
        // handle the token invalid
        const error = JSON.parse(err.error);
        if (error?.error?.message && error?.error?.message.indexOf('access token expiry') > 0) {
          throw new Error(
            `Type: ${error?.error?.code}, Message: ${error?.error?.message}, run az account get-access-token, then replace the accessToken in your configuration`
          );
        } else {
          throw err;
        }
      }
      const account = this.getAccount(jsonRes, luisResource ? luisResource : `${name}-${environment}-luis`);

      for (const k in luisAppIds) {
        const luisAppId = luisAppIds[k];
        this.logger({
          status: BotProjectDeployLoggerType.DEPLOY_INFO,
          message: `Assigning to luis app id: ${luisAppId}`,
        });

        const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`;
        const options = {
          body: account,
          json: true,
          headers: { Authorization: `Bearer ${this.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
        } as rp.RequestPromiseOptions;
        const response = await rp.post(luisAssignEndpoint, options);
        this.logger({
          status: BotProjectDeployLoggerType.DEPLOY_INFO,
          message: response,
        });
      }
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Luis Publish Success! ...',
      });
    }
  }
  /**
   * Deploy a bot to a location
   */
  public async deploy(
    name: string,
    environment: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    botPath?: string,
    language?: string,
    hostname?: string,
    luisResource?: string
  ) {
    try {
      // Check for existing deployment files
      if (!fs.pathExistsSync(this.deployFilePath)) {
        await this.botPrepareDeploy(this.deployFilePath);
      }

      if (await fs.pathExists(this.zipPath)) {
        await fs.remove(this.zipPath);
      }

      // dotnet publish
      await this.dotnetPublish(this.publishFolder, this.projPath, botPath);

      // LUIS build
      const settings = await fs.readJSON(this.settingsPath);
      const luisSettings = settings.luis;

      let luisEndpointKey = '';
      let luisEndpoint = '';
      let luisAuthoringEndpoint = '';

      if (luisSettings) {
        // if luisAuthoringKey is not set, use the one from the luis settings
        luisAuthoringKey = luisAuthoringKey || luisSettings.authoringKey;
        luisAuthoringRegion = luisAuthoringRegion || luisSettings.region;
        luisEndpointKey = luisSettings.endpointKey;
        luisEndpoint = luisSettings.endpoint;
        luisAuthoringEndpoint = luisSettings.authoringEndpoint;
      }

      if (!language) {
        language = 'en-us';
      }

      await this.publishLuis(
        name,
        environment,
        language,
        luisEndpoint,
        luisAuthoringEndpoint,
        luisEndpointKey,
        luisAuthoringKey,
        luisAuthoringRegion,
        luisResource
      );

      // Build a zip file of the project
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Packing up the bot service ...',
      });
      await this.zipDirectory(this.publishFolder, this.zipPath);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Packing Service Success!',
      });

      // Deploy the zip file to the web app
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Publishing to Azure ...',
      });

      await this.deployZip(this.accessToken, this.zipPath, name, environment, hostname);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_SUCCESS,
        message: 'Publish To Azure Success!',
      });
    } catch (error) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_ERROR,
        message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    }
  }

  private getAccount(accounts: any, filter: string) {
    for (const account of accounts) {
      if (account.AccountName === filter) {
        return account;
      }
    }
  }

  // Upload the zip file to Azure
  private async deployZip(token: string, zipPath: string, name: string, env: string, hostname?: string) {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Retrieve publishing details ...',
    });

    const publishEndpoint = `https://${hostname ? hostname : name + '-' + env}.scm.azurewebsites.net/zipdeploy`;
    const fileContent = await fs.readFile(zipPath);
    const options = {
      body: fileContent,
      encoding: null,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/zip',
        'Content-Length': fileContent.length,
      },
    } as rp.RequestPromiseOptions;
    try {
      const response = await rp.post(publishEndpoint, options);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: response,
      });
    } catch (err) {
      if (err.statusCode === 403) {
        throw new Error(
          `Token expired, please run az account get-access-token, then replace the accessToken in your configuration`
        );
      } else {
        throw err;
      }
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

    let settings: any = {};
    if (fs.existsSync(this.settingsPath)) {
      settings = await fs.readJson(this.settingsPath);
    }

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

  /**
   * createAndDeploy
   * provision the Azure resources AND deploy a bot to those resources
   */
  public async createAndDeploy(
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string
  ) {
    await this.create(name, location, environment, appPassword);
    await this.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion);
  }
}
