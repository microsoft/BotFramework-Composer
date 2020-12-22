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
    if (!absSettings.subscriptionId || !absSettings.resourceGroup || !absSettings.botName || !hostname) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Abs settings incomplete, skip linking bot with webapp ...'
      });
      return;
    }

    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Linking bot with webapp ...'
    });

    const subscriptionId = absSettings.subscriptionId;
    const resourceGroupName = absSettings.resourceGroup;
    const botName = absSettings.botName;

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

    console.log(JSON.stringify(botUpdateResult, null, 2));
  }
}
