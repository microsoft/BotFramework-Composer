// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';
import * as util from 'util';

import { TokenCredentials } from '@azure/ms-rest-js';
import { ApplicationInsightsManagementClient } from '@azure/arm-appinsights';
import { AzureBotService } from '@azure/arm-botservice';
import * as fs from 'fs-extra';
import * as rp from 'request-promise';
import archiver from 'archiver';

import { BotProjectDeployConfig } from './botProjectDeployConfig';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';
import { AzureResourceManangerConfig } from './azureResourceManager/azureResourceManagerConfig';
import { AzureResourceMananger, AzureResourceDeploymentStatus } from './azureResourceManager/azureResourceManager';

const exec = util.promisify(require('child_process').exec);
const { promisify } = require('util');

const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const readdir = promisify(fs.readdir);

export class BotProjectDeploy {
  private subId: string;
  private accessToken: string;
  private graphToken: string;
  private projPath: string;
  private deploymentSettingsPath: string;
  private deployFilePath: string;
  private zipPath: string;
  private publishFolder: string;
  private settingsPath: string;
  private dotnetProjectPath: string;
  private generatedFolder: string;
  private remoteBotPath: string;
  private azureResourceManagementClient?: AzureResourceMananger;
  private logger: (string) => any;

  // Will be assigned by create or deploy
  private tenantId = '';

  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.graphToken = config.graphToken;
    this.projPath = config.projPath;
    this.tenantId = config.tenantId;

    // set path to .deployment file which points at the BotProject.csproj
    this.deployFilePath = config.deployFilePath ?? path.join(this.projPath ?? '.', '.deployment');

    // path to the zipped assets
    this.zipPath = config.zipPath ?? path.join(this.projPath ?? '.', 'code.zip');

    // path to the built, ready to deploy code assets
    this.publishFolder = config.publishFolder ?? path.join(this.projPath ?? '.', 'bin', 'Release', 'netcoreapp3.1');

    // path to the source appsettings.deployment.json file
    this.settingsPath = config.settingsPath ?? path.join(this.projPath ?? '.', 'appsettings.deployment.json');

    // path to the deployed settings file that contains additional luis information
    this.deploymentSettingsPath =
      config.deploymentSettingsPath ?? path.join(this.publishFolder ?? '.', 'appsettings.deployment.json');

    // path to the dotnet project file
    this.dotnetProjectPath =
      config.dotnetProjectPath ?? path.join(this.projPath ?? '.', 'Microsoft.BotFramework.Composer.WebApp.csproj');

    // path to the built, ready to deploy declarative assets
    this.remoteBotPath = config.remoteBotPath ?? path.join(this.publishFolder ?? '.', 'ComposerDialogs');

    // path to the ready to deploy generated folder
    this.generatedFolder = config.generatedFolder ?? path.join(this.remoteBotPath ?? '.', 'generated');
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

  /**
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private async getTenantId() {
    if (!this.accessToken) {
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

      const loadResult = await builder.loadContents(modelFiles, language || '', '', luisAuthoringRegion || '');

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
        '',
        language,
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
      const account = this.getAccount(jsonRes, luisResource ? luisResource : `${name}-luis`);

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
    hostname: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    botPath?: string,
    language?: string,
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
        hostname,
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

      await this.deployZip(this.accessToken, this.zipPath, hostname);
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
  private async deployZip(token: string, zipPath: string, hostname: string) {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Retrieve publishing details ...',
    });

    const publishEndpoint = `https://${hostname}.scm.azurewebsites.net/zipdeploy`;
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

      let settings: any = {};
      if (fs.existsSync(this.settingsPath)) {
        settings = await fs.readJson(this.settingsPath);
      }

      // Validate settings
      if (!appId) {
        appId = settings.MicrosoftAppId;
      }

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
    }
  }

  public getProvisionStatus() {
    if (!this.azureResourceManagementClient) {
      return new AzureResourceDeploymentStatus();
    }

    return this.azureResourceManagementClient.getStatus();
  }

  /**
   * createAndDeploy
   * provision the Azure resources AND deploy a bot to those resources
   */
  public async createAndDeploy(
    name: string,
    location: string,
    appId: string,
    appPassword: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string
  ) {
    await this.create(name, location, appId, appPassword);
    await this.deploy(name, luisAuthoringKey, luisAuthoringRegion);
  }
}
