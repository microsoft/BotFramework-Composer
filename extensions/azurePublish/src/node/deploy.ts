// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';
import * as rp from 'request-promise';
import archiver from 'archiver';

import { BotProjectDeployConfig, BotProjectDeployLoggerType } from './types';
import { build, publishLuisToPrediction } from './luisAndQnA';
import { AzurePublishErrors, createCustomizeError, stringifyError } from './utils/errorHandler';

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
    luisResource?: string
  ) {
    try {
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
      // eslint-disable-next-line security/detect-non-literal-fs-filename
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
}
