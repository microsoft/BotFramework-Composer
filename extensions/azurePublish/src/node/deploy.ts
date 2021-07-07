// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable no-underscore-dangle */

import * as path from 'path';

import * as fs from 'fs-extra';
import archiver from 'archiver';
import axios, { AxiosRequestConfig } from 'axios';
import { AzureBotService } from '@azure/arm-botservice';
import { TokenCredentials } from '@azure/ms-rest-js';
import { DialogSetting } from '@botframework-composer/types';

import { BotProjectDeployConfig, BotProjectDeployLoggerType } from './types';
import { build, publishLuisToPrediction } from './luisAndQnA';
import { AzurePublishErrors, createCustomizeError, stringifyError } from './utils/errorHandler';
import { copyDir } from './utils/copyDir';
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
    settings: DialogSetting,
    profileName: string,
    name: string,
    environment: string,
    hostname?: string,
    luisResource?: string,
    absSettings?: any
  ) {
    try {
      this.logger(absSettings);

      await this.linkBotWithWebapp(settings, absSettings, hostname);

      if (absSettings) {
        await this.BindKeyVault(absSettings, hostname);
      }

      // Update skill host endpoint
      if (settings?.skill && Object.keys(settings?.skill).length > 0) {
        settings.skillHostEndpoint = `https://${hostname}.azurewebsites.net/api/skills`;
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
        message: 'Building the bot app...',
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
        this.logger,
        settings?.runtime
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

      // COPY MANIFESTS TO wwwroot/manifests
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (await project.fileStorage.exists(path.join(pathToArtifacts, 'manifests'))) {
        await copyDir(
          path.join(pathToArtifacts, 'manifests'),
          project.fileStorage,
          path.join(pathToArtifacts, 'wwwroot', 'manifests'),
          project.fileStorage
        );
        // Update skill endpoint url in skill manifest.
        await this.updateSkillSettings(
          profileName,
          hostname,
          settings.MicrosoftAppId,
          path.join(pathToArtifacts, 'wwwroot', 'manifests')
        );
      }

      // STEP 4: ZIP THE ASSETS
      // Build a zip file of the project
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Creating build artifact...',
      });
      await this.zipDirectory(pathToArtifacts, settings, this.zipPath);
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

  /**
   * update the skill related settings to skills' manifest
   * @param hostname hostname of web app
   * @param msAppId microsoft app id
   * @param skillSettingsPath the path of skills manifest settings
   */
  private async updateSkillSettings(profileName: string, hostname: string, msAppId: string, skillSettingsPath: string) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe as no value holds user input */
    const manifestFiles = (await fs.readdir(skillSettingsPath)).filter((x) => x.endsWith('.json'));
    if (manifestFiles.length === 0) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: `The manifest does not exist on path: ${skillSettingsPath}`,
      });
      return;
    }

    for (const manifestFile of manifestFiles) {
      const hostEndpoint = `https://${hostname}.azurewebsites.net/api/messages`;

      const manifest = await fs.readJson(path.join(skillSettingsPath, manifestFile));

      const endpointIndex = manifest.endpoints.findIndex((x) => x.name === profileName);
      if (endpointIndex > -1) {
        // already exists
        return;
      }
      manifest.endpoints.push({
        protocol: 'BotFrameworkV3',
        name: profileName,
        endpointUrl: hostEndpoint,
        description: '<description>',
        msAppId: msAppId,
      });

      await fs.writeJson(path.join(skillSettingsPath, manifestFile), manifest, { spaces: 2 });
    }
  }

  private async zipDirectory(source: string, settings: any, out: string) {
    console.log(`Zip the files in ${source} into a zip file ${out}`);
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const stream = fs.createWriteStream(out);
      return new Promise((resolve, reject) => {
        archive
          .glob('**/*', {
            cwd: source,
            dot: true,
            ignore: ['**/code.zip', '**/settings/appsettings.json'],
          })
          .on('error', (err) => reject(err))
          .pipe(stream);

        stream.on('close', () => resolve());

        // write the merged settings to the deploy artifact
        archive.append(JSON.stringify(settings, null, 2), { name: 'settings/appsettings.json' });
        archive.finalize();
      });
    } catch (error) {
      createCustomizeError(AzurePublishErrors.ZIP_FOLDER_ERROR, stringifyError(error));
    }
  }

  private async waitForZipDeploy(token: string, statusUrl: string): Promise<void> {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: `Waiting for zip upload processing.`,
    });

    return new Promise((resolve, reject) => {
      const timerId = setInterval(async () => {
        try {
          const statusResponse = await axios.get(statusUrl, { headers: { Authorization: `Bearer ${token}` } });

          if (statusResponse.data.provisioningState === 'Succeeded') {
            this.logger({
              status: BotProjectDeployLoggerType.DEPLOY_INFO,
              message: 'Zip upload processed successfully.',
            });
            clearInterval(timerId);
            resolve();
          } else if (statusResponse.data.provisioningState === 'Failed') {
            clearInterval(timerId);
            reject(`Zip upload processing failed. ${statusResponse.data.status_text}`);
          } else {
            this.logger({
              status: BotProjectDeployLoggerType.DEPLOY_INFO,
              message: `Waiting for zip upload processing. ${statusResponse.data.status_text}`,
            });
          }
        } catch (err) {
          const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
          clearInterval(timerId);
          reject(`Getting status of zip upload processing failed. ${errorMessage}`);
        }
      }, 5000);
    });
  }

  // Upload the zip file to Azure
  // DOCS HERE: https://docs.microsoft.com/en-us/azure/app-service/deploy-zip
  private async deployZip(token: string, zipPath: string, name: string, env: string, hostname?: string) {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: `Uploading zip file... to ${hostname ? hostname : name + (env ? '-' + env : '')}`,
    });

    const publishEndpoint = `https://${
      hostname ? hostname : name + (env ? '-' + env : '')
    }.scm.azurewebsites.net/zipdeploy/?isAsync=true`;
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const fileReadStream = fs.createReadStream(zipPath, { autoClose: true });
    fileReadStream.on('error', function (err) {
      this.logger('%O', err);
      throw err;
    });

    try {
      const response = await axios.post(publishEndpoint, fileReadStream, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-zip-compressed' },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status === 202) {
        await this.waitForZipDeploy(token, response.headers.location);
      }
    } catch (err) {
      // close file read stream
      fileReadStream.close();
      if (err.statusCode === 403) {
        throw createCustomizeError(
          AzurePublishErrors.DEPLOY_ZIP_ERROR,
          `Token expired, please run az account get-access-token, then replace the accessToken in your configuration`
        );
      } else {
        const errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
        throw createCustomizeError(
          AzurePublishErrors.DEPLOY_ZIP_ERROR,
          `There was a problem publishing bot assets (zip deploy). ${errorMessage}`
        );
      }
    }
  }

  /**
   * link the bot channel registration with azure web app service
   * @param absSettings the abs settings
   * @param hostname the hostname of webapp which bot service would be linked to
   */
  private async linkBotWithWebapp(settings: any, absSettings: any, hostname: string) {
    let subscriptionId = '';
    let resourceGroupName = '';
    let botName = '';

    if (absSettings.resourceId) {
      try {
        if (!subscriptionId) {
          subscriptionId = absSettings.resourceId.match(/subscriptions\/([\w-]*)\//)[1];
        }
        if (!resourceGroupName) {
          resourceGroupName = absSettings.resourceId.match(/resourceGroups\/([^/]*)/)[1];
        }
        if (!botName) {
          botName = absSettings.resourceId.match(/botServices\/([^/]*)/)[1];
        }
      } catch (error) {
        this.logger({
          status: BotProjectDeployLoggerType.DEPLOY_INFO,
          message: 'Abs settings resourceId is incomplete, skip linking bot with webapp ...',
        });
        return;
      }
    } else {
      subscriptionId = settings.subscriptionId;
      resourceGroupName = settings.resourceGroup;
      botName = settings.botName;
    }

    if (!subscriptionId || !hostname || !resourceGroupName || !botName) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Abs settings incomplete, skip linking bot with webapp ...',
      });
      return;
    }

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Linking bot with webapp ...',
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
        webapp: hostname,
      },
      properties: bot.properties,
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
    if (!hostname) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'hostname incomplete, return ...',
      });
      return;
    }

    const webAppName = hostname;
    const hint = absSettings.appPasswordHint;
    if (!hint) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'appPasswordHint incomplete, return ...',
      });
      return;
    }
    const vaultName = hint.match(/vaults\/([^/]*)/)[1];
    const secretName = hint.match(/secrets\/([^/]*)/)[1];
    const subscriptionId = hint.match(/subscriptions\/([\w-]*)\//)[1];
    const resourceGroupName = hint.match(/resourceGroups\/([^/]*)/)[1];

    const email = absSettings.email;

    this.logger(`${subscriptionId}, ${resourceGroupName}, ${webAppName}, ${vaultName}, ${secretName}, ${email}`);

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Binding Key Vault ...',
    });

    const creds = new TokenCredentials(this.accessToken);

    const keyVaultApiConfig = {
      creds: creds,
      logger: this.logger,
      subscriptionId: subscriptionId,
    } as KeyVaultApiConfig;
    const keyVaultApi = new KeyVaultApi(keyVaultApiConfig);

    await keyVaultApi.WebAppAssignIdentity(resourceGroupName, webAppName);

    const principalId = await keyVaultApi.WebAppIdentityShow(resourceGroupName, webAppName);
    this.logger(`principal id : ${principalId}`);

    const tenantId = await this.getTenantId(this.accessToken, subscriptionId);
    await keyVaultApi.KeyVaultSetPolicy(resourceGroupName, vaultName, email, principalId, tenantId);

    this.logger('getting secret ...');
    const secret = await keyVaultApi.KeyVaultGetSecret(resourceGroupName, vaultName, secretName);

    // const secret = await keyVaultApi.KeyVaultGetSecretValue(resourceGroupName, vaultName, secretName);

    this.logger(`secret: ${secret}`);
    await keyVaultApi.UpdateKeyVaultAppSettings(resourceGroupName, webAppName, secret);

    // await keyVaultApi.UpdateKeyVaultValueAppSettings(resourceGroupName, webAppName, secret);
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
      const options: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${accessToken}` },
      };
      const response = await axios.get(tenantUrl, options);
      const jsonRes = JSON.parse(response?.data);
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
    throw new Error('Required field `name` or `hostname` is missing from publishing profile.');
  }
  if (!profile.settings?.MicrosoftAppId) {
    throw Error('Required field `MicrosoftAppId` is missing from publishing profile.');
  }
};

export const getAbsSettings = (config) => {
  return {
    appPasswordHint: config.appPasswordHint,
    subscriptionId: config.subscriptionId,
    resourceGroup: config.resourceGroup,
    resourceId: config.resourceId,
    botName: config.botName,
  };
};
