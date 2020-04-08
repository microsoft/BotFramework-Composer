// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WebSiteManagementClient } from '@azure/arm-appservice-profile-2019-03-01-hybrid';
import { ResourceManagementClient } from '@azure/arm-resources';
import {
  Deployment,
  DeploymentsCreateOrUpdateResponse,
  DeploymentsValidateResponse,
  ResourceGroup,
  ResourceGroupsCreateOrUpdateResponse,
} from '@azure/arm-resources/esm/models';
import { GraphRbacManagementClient } from '@azure/graph';
import * as msRestNodeAuth from '@azure/ms-rest-nodeauth';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as rp from 'request-promise';
import * as util from 'util';
import { BotProjectDeployConfig } from './botProjectDeployConfig';
import archiver = require('archiver');
const exec = util.promisify(require('child_process').exec);
const luBuild = require('@microsoft/bf-lu/lib/parser/lubuild/builder.js');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

export class BotProjectDeploy {
  private subId: string;
  private creds: any;
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

  private readonly tenantId = '72f988bf-86f1-41af-91ab-2d7cd011db47';

  constructor(config: BotProjectDeployConfig) {
    this.subId = config.subId;
    this.logger = config.logger;
    this.creds = config.creds;
    this.projPath = config.projPath;
    this.deployFilePath = config.deployFilePath ?? path.join(this.projPath, '.deployment');
    this.zipPath = config.zipPath ?? path.join(this.projPath, 'code.zip');
    this.publishFolder = config.publishFolder ?? path.join(this.projPath, 'bin\\Release\\netcoreapp3.1');
    this.settingsPath = config.settingsPath ?? path.join(this.projPath, 'appsettings.deployment.json');
    this.deploymentSettingsPath =
      config.deploymentSettingsPath ?? path.join(this.publishFolder, 'appsettings.deployment.json');
    this.templatePath = config.templatePath ?? path.join('DeploymentTemplates', 'template-with-preexisting-rg.json');
    this.dotnetProjectPath = config.dotnetProjectPath ?? path.join(this.projPath, 'BotProject.csproj');
    this.remoteBotPath = config.remoteBotPath ?? path.join(this.publishFolder, 'ComposerDialogs');
    this.generatedFolder = config.generatedFolder ?? path.join(this.remoteBotPath, 'generated');
  }

  private pack(scope: any) {
    return {
      value: scope,
    };
  }

  private getDeploymentTemplateParam(
    appId: string,
    appPwd: string,
    location: string,
    name: string,
    shouldCreateAuthoringResource: boolean
  ) {
    return {
      appId: this.pack(appId),
      appSecret: this.pack(appPwd),
      appServicePlanLocation: this.pack(location),
      botId: this.pack(name),
      shouldCreateAuthoringResource: this.pack(shouldCreateAuthoringResource),
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

  private async createResourceGroup(
    client: ResourceManagementClient,
    location: string,
    resourceGroupName: string
  ): Promise<ResourceGroupsCreateOrUpdateResponse> {
    this.logger(`> Creating resource group ...`);
    const param = {
      location: location,
    } as ResourceGroup;

    return await client.resourceGroups.createOrUpdate(resourceGroupName, param);
  }

  private async validateDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsValidateResponse> {
    this.logger('> Validating Azure deployment ...');
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

  private async createDeployment(
    client: ResourceManagementClient,
    templatePath: string,
    location: string,
    resourceGroupName: string,
    deployName: string,
    templateParam: any
  ): Promise<DeploymentsCreateOrUpdateResponse> {
    this.logger(`> Deploying Azure services (this could take a while)...`);
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

  private unpackObject(output: any) {
    let unpakced: any = {};
    for (const key in output) {
      const objValue = output[key];
      if (objValue.value) {
        unpakced[key] = objValue.value;
      }
    }
    return unpakced;
  }

  private async updateDeploymentJsonFile(
    settingsPath: string,
    client: ResourceManagementClient,
    resourceGroupName: string,
    deployName: string,
    appId: string,
    appPwd: string
  ): Promise<any> {
    const outputs = await client.deployments.get(resourceGroupName, deployName);
    return new Promise((resolve, reject) => {
      if (outputs?.properties?.outputs) {
        const outputResult = outputs.properties.outputs;
        const applicatoinResult = {
          MicrosoftAppId: appId,
          MicrosoftAppPassword: appPwd,
        };
        const outputObj = this.unpackObject(outputResult);

        let result = {};
        Object.assign(result, outputObj, applicatoinResult);

        fs.writeFile(settingsPath, JSON.stringify(result, null, 4), err => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      } else {
        resolve({});
      }
    });
  }

  private async getFiles(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map(dirent => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? this.getFiles(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  private async botPrepareDeploy(pathToDeploymentFile: string) {
    return new Promise((resolve, reject) => {
      const data = `[config]\nproject = BotProject.csproj`;
      fs.writeFile(pathToDeploymentFile, data, err => {
        reject(err);
      });
    });
  }

  private async dotnetPublish(publishFolder: string, projFolder: string, botPath?: string) {
    await exec(`dotnet publish ${this.dotnetProjectPath} -c release -o ${publishFolder} -v q`);
    return new Promise((resolve, reject) => {
      const remoteBotPath = path.join(publishFolder, 'ComposerDialogs');
      const localBotPath = path.join(projFolder, 'ComposerDialogs');

      if (botPath) {
        this.logger(`Publishing dialogs from external bot project: ${botPath}`);
        fs.copy(
          botPath,
          remoteBotPath,
          {
            overwrite: true,
            recursive: true,
          },
          err => {
            reject(err);
          }
        );
      } else {
        fs.copy(
          localBotPath,
          remoteBotPath,
          {
            overwrite: true,
            recursive: true,
          },
          err => {
            reject(err);
          }
        );
      }
      resolve();
    });
  }

  private async zipDirectory(source: string, out: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
      archive
        .directory(source, false)
        .on('error', err => reject(err))
        .pipe(stream);

      stream.on('close', () => resolve());
      archive.finalize();
    });
  }

  private notEmptyLuisModel(file: string) {
    return fs.readFileSync(file).length > 0;
  }

  public async deploy(
    name: string,
    environment: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    logFile?: string,
    botPath?: string,
    language?: string
  ) {
    const webClient = new WebSiteManagementClient(this.creds, this.subId);

    // Check for existing deployment files
    if (!(await fs.pathExists(this.deployFilePath))) {
      await this.botPrepareDeploy(this.deployFilePath);
    }

    if (await fs.pathExists(this.zipPath)) {
      await fs.remove(this.zipPath);
    }

    // dotnet publish
    await this.dotnetPublish(this.publishFolder, this.projPath, botPath);
    const settings = await fs.readJSON(this.settingsPath);
    const luisSettings = settings.luis;

    let luisEndpointKey: string = '';

    if (!luisAuthoringKey) {
      luisAuthoringKey = luisSettings.authoringKey;
      luisEndpointKey = luisSettings.endpointKey;
    }

    if (!luisAuthoringRegion) {
      luisAuthoringRegion = luisSettings.region;
    }

    if (!language) {
      language = 'en-us';
    }

    if (luisAuthoringKey && luisAuthoringRegion) {
      // publishing luis
      const botFiles = await this.getFiles(this.remoteBotPath);
      const modelFiles = botFiles.filter(name => {
        return name.endsWith('.lu') && this.notEmptyLuisModel(name);
      });

      if (!(await fs.pathExists(this.generatedFolder))) {
        await fs.mkdir(this.generatedFolder);
      }
      let builder = new luBuild.Builder(msg => this.logger(msg));

      const loadResult = await builder.loadContents(
        modelFiles,
        language || '',
        environment || '',
        luisAuthoringRegion || ''
      );

      const buildResult = await builder.build(
        loadResult.luContents,
        loadResult.recognizers,
        luisAuthoringKey,
        luisAuthoringRegion,
        name,
        environment,
        language,
        false,
        loadResult.multiRecognizers,
        loadResult.settings
      );
      await builder.writeDialogAssets(buildResult, true, this.generatedFolder);

      this.logger(`lubuild succeed`);

      const luisConfigFiles = (await this.getFiles(this.remoteBotPath)).filter(filename =>
        filename.includes('luis.settings')
      );
      let luisAppIds: any = {};

      for (let luisConfigFile of luisConfigFiles) {
        const luisSettings = await fs.readJson(luisConfigFile);
        Object.assign(luisAppIds, luisSettings.luis);
      }

      const luisEndpoint = `https://${luisAuthoringRegion}.api.cognitive.microsoft.com`;
      let luisConfig: any = {
        endpoint: luisEndpoint,
        endpointKey: luisEndpointKey,
      };

      Object.assign(luisConfig, luisAppIds);

      let settings: any = await fs.readJson(this.deploymentSettingsPath);
      settings['luis'] = luisConfig;

      await fs.writeJson(this.deploymentSettingsPath, settings);
      const token = await this.creds.getToken();

      const getAccountUri = `${luisEndpoint}/luis/api/v2.0/azureaccounts`;
      const options = {
        headers: { Authorization: `Bearer ${token.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
      } as rp.RequestPromiseOptions;
      const response = await rp.get(getAccountUri, options);
      const jsonRes = JSON.parse(response);
      const account = this.getAccount(jsonRes, `${name}-${environment}-luis`);

      for (let k in luisAppIds) {
        const luisAppId = luisAppIds[k];
        this.logger(`Assigning to luis app id: ${luisAppIds}`);
        const luisAssignEndpoint = `${luisEndpoint}/luis/api/v2.0/apps/${luisAppId}/azureaccounts`;
        const options = {
          body: account,
          json: true,
          headers: { Authorization: `Bearer ${token.accessToken}`, 'Ocp-Apim-Subscription-Key': luisAuthoringKey },
        } as rp.RequestPromiseOptions;
        const response = await rp.post(luisAssignEndpoint, options);
        this.logger(response);
      }
      this.logger('Luis Publish Success! ...');
    }
    this.logger('Packing up the bot service ...');
    await this.zipDirectory(this.publishFolder, this.zipPath);
    this.logger('Packing Service Success!');

    this.logger('Publishing to Azure ...');
    await this.deployZip(webClient, this.zipPath, name, environment);
    this.logger('Publish To Azure Success!');
  }

  private getAccount(accounts: any, filter: string) {
    for (let account of accounts) {
      if (account.AccountName === filter) {
        return account;
      }
    }
  }

  private async deployZip(webSiteClient: WebSiteManagementClient, zipPath: string, name: string, env: string) {
    this.logger('Retrieve publishing details ...');
    const userName = `${name}-${env}`;
    const userPwd = `${name}-${env}-${new Date().getTime().toString()}`;

    const updateRes = await webSiteClient.updatePublishingUser({
      publishingUserName: userName,
      publishingPassword: userPwd,
    });
    this.logger(updateRes);

    const publishEndpoint = `https://${name}-${env}.scm.azurewebsites.net/zipdeploy`;

    const publishCreds = Buffer.from(`${userName}:${userPwd}`).toString('base64');

    const fileContent = await fs.readFile(zipPath);
    const options = {
      body: fileContent,
      encoding: null,
      headers: {
        Authorization: `Basic ${publishCreds}`,
        'Content-Type': 'application/zip',
        'Content-Length': fileContent.length,
      },
    } as rp.RequestPromiseOptions;
    const response = await rp.post(publishEndpoint, options);
    this.logger(response);
  }

  public async create(
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    luisAuthoringKey?: string
  ) {
    const credsForGraph = new msRestNodeAuth.DeviceTokenCredentials(
      this.creds.clientId,
      this.tenantId,
      this.creds.username,
      'graph',
      this.creds.environment,
      this.creds.tokenCache
    );
    const graphClient = new GraphRbacManagementClient(credsForGraph, this.tenantId, {
      baseUri: 'https://graph.windows.net',
    });

    if (!fs.existsSync(this.deploymentSettingsPath)) {
      this.logger(`! Could not find an 'appsettings.deployment.json' file in the current directory.`);
      return;
    }

    const settings = await fs.readJson(this.deploymentSettingsPath);
    let appId = settings.MicrosoftAppId;

    if (!appId) {
      if (!appPassword) {
        this.logger(`App password is required`);
        return;
      }
      this.logger('> Creating App Registration ...');
      const appCreated = await this.createApp(graphClient, name, appPassword);
      this.logger(appCreated);
      appId = appCreated.appId;
    }

    this.logger(`> Create App Id Success! ID: ${appId}`);

    var shouldCreateAuthoringResource = true;
    if (luisAuthoringKey) {
      shouldCreateAuthoringResource = false;
    }

    const resourceGroupName = `${name}-${environment}`;

    // timestamp will be used as deployment name
    const timeStamp = new Date().getTime().toString();
    const client = new ResourceManagementClient(this.creds, this.subId);

    const rpres = await this.createResourceGroup(client, location, resourceGroupName);
    this.logger(rpres);

    const deploymentTemplateParam = this.getDeploymentTemplateParam(
      appId,
      appPassword,
      location,
      name,
      shouldCreateAuthoringResource
    );
    this.logger(deploymentTemplateParam);

    const validation = await this.validateDeployment(
      client,
      this.templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    this.logger(validation);

    if (validation.error) {
      this.logger(`! Template is not valid with provided parameters. Review the log for more information.`);
      this.logger(`! Error: ${validation.error.message}`);
      this.logger(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
      return false;
    }

    const deployment = await this.createDeployment(
      client,
      this.templatePath,
      location,
      resourceGroupName,
      timeStamp,
      deploymentTemplateParam
    );
    this.logger(deployment);

    if (deployment._response.status != 200) {
      this.logger(`! Template is not valid with provided parameters. Review the log for more information.`);
      this.logger(`! Error: ${validation.error}`);
      this.logger(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
      return false;
    }

    const updateResult = await this.updateDeploymentJsonFile(
      this.deploymentSettingsPath,
      client,
      resourceGroupName,
      timeStamp,
      appId,
      appPassword
    );
    this.logger(updateResult);

    if (!updateResult) {
      const operations = await client.deploymentOperations.list(resourceGroupName, timeStamp);
      if (operations) {
        const failedOperations = operations.filter(value => value?.properties?.statusMessage.error !== null);
        if (failedOperations) {
          failedOperations.forEach(operation => {
            switch (operation?.properties?.statusMessage.error.code) {
              case 'MissingRegistrationForLocation':
                this.logger(
                  `! Deployment failed for resource of type ${operation?.properties?.targetResource?.resourceType}. This resource is not avaliable in the location provided.`
                );
                break;
              default:
                this.logger(
                  `! Deployment failed for resource of type ${operation?.properties?.targetResource?.resourceType}.`
                );
                this.logger(`! Code: ${operation?.properties?.statusMessage.error.code}.`);
                this.logger(`! Message: ${operation?.properties?.statusMessage.error.message}.`);
                break;
            }
          });
        }
      } else {
        this.logger(`! Deployment failed. Please refer to the log file for more information.`);
      }
    }
    this.logger(`+ To delete this resource group, run 'az group delete -g ${resourceGroupName} --no-wait'`);
  }

  public async createAndDeploy(
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    appId?: string
  ) {
    await this.create(name, location, environment, appPassword, luisAuthoringKey);
    await this.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion);
  }
}
