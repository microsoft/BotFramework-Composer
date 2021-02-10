// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';
import * as rp from 'request-promise';

import { BotProjectDeployConfig, BotProjectDeployLoggerType } from './types';
import { build, publishLuisToPrediction } from './luisAndQnA';
import archiver = require('archiver');
import { AzurePublishErrors, createCustomizeError, stringifyError } from './utils/errorHandler';
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import { KeyVaultApi } from './keyvaultHelper/keyvaultApi';
import { KeyVaultApiConfig } from './keyvaultHelper/keyvaultApiConfig';

export class BotProjectDeploy {
  private accessToken: string;
  private projPath: string;
  private zipPath: string;
  private logger: (...args: any[]) => void;
  private runtime: any;

  constructor(config: BotProjectDeployConfig) {
    this.logger = config.logger;
    this.accessToken = config.accessToken;
    this.projPath = config.projPath;
    // get the appropriate runtime
    this.runtime = config.runtime;

    // path to the zipped assets
    this.zipPath = config.zipPath ?? path.join(this.projPath, 'code.zip');
  }

  /*******************************************************************************************************************************/
  /* This section has to do with deploying to existing Azure resources
  /*******************************************************************************************************************************/

  /**
   * Deploy a bot to a location
   */
  public async deploy(
    project: any,
    settings: any,
    profileName: string,
    name: string,
    environment: string,
    hostname?: string,
    luisResource?: string,
    absSettings?: any
  ) {
    try {
      console.log(absSettings);
      if (absSettings) {
        await this.linkBotWithWebapp(absSettings, hostname);
      }

      if (absSettings) {
        await this.BindKeyVault(absSettings, hostname);
      }

      // STEP 1: CLEAN UP PREVIOUS BUILDS
      // cleanup any previous build
      if (await fs.pathExists(this.zipPath)) {
        await fs.remove(this.zipPath);
      }

      // STEP 2: UPDATE LUIS
      // Do the LUIS build if LUIS settings are present
      let language = settings.defaultLanguage || settings.luis.defaultLanguage;
      if (!language) {
        language = 'en-us';
      }

      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: "Building the bot app...",
      });
      await build(project, this.projPath, settings);

      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Build succeeded!',
      });

      // this function returns an object that contains the luis APP ids mapping
      // each dialog to its matching app.
      const luisAppIds = await publishLuisToPrediction(
        name,
        environment,
        this.accessToken,
        settings.luis,
        luisResource,
        this.projPath,
        this.logger
      );

      const qnaConfig = await project.builder.getQnaConfig();

      // amend luis settings with newly generated values
      settings.luis = {
        ...settings.luis,
        ...luisAppIds,
      };
      settings.qna = {
        ...settings.qna,
        ...qnaConfig,
      };

      // STEP 3: BUILD
      // run any platform specific build steps.
      // this returns a pathToArtifacts where the deployable version lives.
      const pathToArtifacts = await this.runtime.buildDeploy(this.projPath, project, settings, profileName);

      // STEP 4: ZIP THE ASSETS
      // Build a zip file of the project
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Creating build artifact...',
      });
      await this.zipDirectory(pathToArtifacts, this.zipPath);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Build artifact ready!',
      });

      // STEP 5: DEPLOY THE ZIP FILE TO AZURE
      // Deploy the zip file to the web app
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Publishing to Azure ...',
      });
      await this.deployZip(this.accessToken, this.zipPath, name, environment, hostname);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_SUCCESS,
        message: 'Published successfully!',
      });
    } catch (error) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_ERROR,
        message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      throw error;
    }
  }

  private async zipDirectory(source: string, out: string) {
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = fs.createWriteStream(out);
      return new Promise((resolve, reject) => {
        archive
          .glob('**/*', {
            cwd: source,
            dot: true,
            ignore: ['**/code.zip', 'node_modules/**/*'],
          })
          .on('error', (err) => reject(err))
          .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
      });
    } catch (error) {
      createCustomizeError(AzurePublishErrors.ZIP_FOLDER_ERROR, stringifyError(error));
    }
  }

  // Upload the zip file to Azure
  // DOCS HERE: https://docs.microsoft.com/en-us/azure/app-service/deploy-zip
  private async deployZip(token: string, zipPath: string, name: string, env: string, hostname?: string) {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Uploading zip file...',
    });

    const publishEndpoint = `https://${hostname ? hostname : name + (env ? '-' + env : '')
      }.scm.azurewebsites.net/zipdeploy/?isAsync=true`;
    const fileReadStream = fs.createReadStream(zipPath, { autoClose: true });
    fileReadStream.on('error', function (err) {
      this.logger('%O', err);
      throw err;
    });

    try {
      const response = await rp.post({
        uri: publishEndpoint,
        auth: {
          bearer: token,
        },
        body: fileReadStream,
      });
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: response,
      });
    } catch (err) {
      // close file read stream
      fileReadStream.close();
      if (err.statusCode === 403) {
        throw createCustomizeError(
          AzurePublishErrors.DEPLOY_ZIP_ERROR,
          `Token expired, please run az account get-access-token, then replace the accessToken in your configuration`
        );
      } else {
        throw createCustomizeError(AzurePublishErrors.DEPLOY_ZIP_ERROR, stringifyError(err));
      }
    }
  }

  /**
   * link the bot channel registration with azure web app service
   * @param absSettings the abs settings
   * @param hostname the hostname of webapp which bot service would be linked to
   */
  private async linkBotWithWebapp(absSettings: any, hostname: string) {
    let subscriptionId = '', resourceGroupName = '', botName = '';
    if (!absSettings.resourceId || !hostname) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Abs settings incomplete, skip linking bot with webapp ...'
      });
      return;
    }
    try {
      subscriptionId = absSettings.resourceId.match(/subscriptions\/([\w-]*)\//)[1];
      resourceGroupName = absSettings.resourceId.match(/resourceGroups\/([^\/]*)/)[1];
      botName = absSettings.resourceId.match(/botServices\/([^\/]*)/)[1];
    } catch (error) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Abs settings resourceId is incomplete, skip linking bot with webapp ...'
      });
      return;
    }

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Linking bot with webapp ...'
    });

    const creds = new TokenCredentials(this.accessToken);
    const azureBotSerivce = new AzureBotService(creds, subscriptionId);

    const botGetResult = await azureBotSerivce.bots.get(resourceGroupName, botName);
    if (botGetResult?._response?.status >= 300) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_ERROR,
        message: botGetResult._response?.bodyAsText,
      });
      throw createCustomizeError(AzurePublishErrors.ABS_ERROR, botGetResult._response?.bodyAsText);
    }

    const bot = botGetResult._response.parsedBody;
    bot.properties.endpoint = `https://${hostname}.azurewebsites.net/api/messages`;

    const botUpdateResult = await azureBotSerivce.bots.update(resourceGroupName, botName, {
      tags: {
        webapp: hostname
      },
      properties: bot.properties
    });

    if (botUpdateResult?._response?.status >= 300) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_ERROR,
        message: botUpdateResult._response?.bodyAsText,
      });
      throw createCustomizeError(AzurePublishErrors.ABS_ERROR, botUpdateResult._response?.bodyAsText);
    }
  }

  /**
   * Bind key vault settings to webapp
   * @param absSettings
   */
  private async BindKeyVault(absSettings: any, hostname: string) {
    const subscriptionId = absSettings.subscriptionId;
    const resourceGroupName = absSettings.resourceGroup;
    const webAppName = hostname;
    const hint = absSettings.appPasswordHint;
    const hintsList = hint.split('/');
    const vaultName = hintsList.length > 8 ? hintsList[8] : '';
    const secretName = hintsList.length > 10 ? hintsList[10] : '';
    const email = absSettings.email;

    console.log(`${subscriptionId}, ${resourceGroupName}, ${webAppName}, ${hintsList}, ${vaultName}, ${secretName}, ${email}`);

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Binding Key Vault ...'
    });

    const creds = new TokenCredentials(this.accessToken);

    const keyVaultApiConfig = {
      creds: creds,
      logger: this.logger,
      subscriptionId: subscriptionId
    } as KeyVaultApiConfig;
    const keyVaultApi = new KeyVaultApi(keyVaultApiConfig);

    await keyVaultApi.WebAppAssignIdentity(resourceGroupName, webAppName);

    const principalId = await keyVaultApi.WebAppIdentityShow(resourceGroupName, webAppName);
    console.log(`principal id : ${principalId}`);

    const tenantId = await this.getTenantId(this.accessToken, subscriptionId);
    await keyVaultApi.KeyVaultSetPolicy(resourceGroupName, vaultName, email, principalId, tenantId);

    console.log('getting secret ...')
    const secret = await keyVaultApi.KeyVaultGetSecret(resourceGroupName, vaultName, secretName);

    console.log(`secret: ${secret}`);
    await keyVaultApi.UpdateKeyVaultAppSettings(resourceGroupName, webAppName, secret);
  }

  private async getTenantId(accessToken: string, subId: string) {
    if (!accessToken) {
      throw new Error(
        'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
      );
    }
    if (!subId) {
      throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
    }
    try {
      const tenantUrl = `https://management.azure.com/subscriptions/${subId}?api-version=2020-01-01`;
      const options = {
        headers: { Authorization: `Bearer ${accessToken}` },
      };
      const response = await rp.get(tenantUrl, options);
      const jsonRes = JSON.parse(response);
      if (jsonRes.tenantId === undefined) {
        throw new Error(`No tenants found in the account.`);
      }
      return jsonRes.tenantId;
    } catch (err) {
      throw new Error(`Get Tenant Id Failed`);
    }
  }
}

export const isProfileComplete = (profile) => {
  if (!profile) {
    throw new Error('Required field `settings` is missing from publishing profile.');
  }
  if (!profile.hostname && !profile.name) {
    throw new Error("Required field `name` or `hostname` is missing from publishing profile.");
  }
  if (!profile.settings?.MicrosoftAppId) {
    throw Error('Required field `MicrosoftAppId` is missing from publishing profile.');
  }
}

export const getAbsSettings = (config)=>{
  return {
    appPasswordHint: config.appPasswordHint,
    subscriptionId: config.subscriptionId,
    resourceGroup: config.resourceGroup,
    resourceId: config.resourceId,
    botName: config.botName
  };
}