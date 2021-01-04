// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import * as fs from 'fs-extra';
import * as rp from 'request-promise';

import { BotProjectDeployConfig } from './botProjectDeployConfig';
import { BotProjectDeployLoggerType } from './botProjectLoggerType';
import { LuisAndQnaPublish } from './luisAndQnA';
import * as axios from 'axios';
import archiver = require('archiver');

const proxy = require("node-global-proxy").default;

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
    proxySettings?: string,
  ) {
    try {
      console.log(JSON.stringify(settings, null, 2))
      if (proxySettings) {
        this.logger({
          status: BotProjectDeployLoggerType.DEPLOY_INFO,
          message: `Remote deploy using http proxy: ${proxySettings}`,
        })
        proxy.setConfig(proxySettings);
        proxy.start();
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
      const publisher = new LuisAndQnaPublish({ logger: this.logger, projPath: this.projPath });

      // this function returns an object that contains the luis APP ids mapping
      // each dialog to its matching app.
      const { luisAppIds, qnaConfig } = await publisher.publishLuisAndQna(
        name,
        environment,
        this.accessToken,
        language,
        settings.luis,
        settings.qna,
        luisResource
      );

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

      if (proxySettings) {
        proxy.stop();
      }
      // STEP 4: ZIP THE ASSETS
      // Build a zip file of the project
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Packing up the bot service ...',
      });
      await this.zipDirectory(pathToArtifacts, this.zipPath);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Packing Service Success!',
      });

      // STEP 5: DEPLOY THE ZIP FILE TO AZURE
      // Deploy the zip file to the web app
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: 'Publishing to Azure ...',
      });
      await this.deployZip(this.accessToken, this.zipPath, name, environment, hostname, proxySettings);
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_SUCCESS,
        message: 'Publish To Azure Success!',
      });
    } catch (error) {
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_ERROR,
        message: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
      if (proxySettings) {
        proxy.stop();
      }
      throw error;
    }
  }

  private async zipDirectory(source: string, out: string) {
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
  }

  // Upload the zip file to Azure
  // DOCS HERE: https://docs.microsoft.com/en-us/azure/app-service/deploy-zip
  private async deployZip(token: string, zipPath: string, name: string, env: string, hostname?: string, proxySettings?: string) {
    this.logger({
      status: BotProjectDeployLoggerType.DEPLOY_INFO,
      message: 'Retrieve publishing details ...',
    });

    const publishEndpoint = `https://${hostname ? hostname : name + '-' + env
      }.scm.azurewebsites.net/zipdeploy/?isAsync=true`;
    const fileReadStream = fs.createReadStream(zipPath, { autoClose: true });
    fileReadStream.on('error', function (err) {
      this.logger('%O', err);
      throw err;
    });

    try {
      let response = undefined;
      if (proxySettings) {
        const protocol = proxySettings.startsWith('https') ? 'https' : 'http';
        const other = protocol == 'https' ? proxySettings.slice(8) : proxySettings.slice(7);
        const host = other.split(':')[0]
        const port = parseInt(other.split(':')[1]);
        console.log(`protocol : ${protocol}, host: ${host}, port: ${port}, publishEndpoint: ${publishEndpoint}, proxy: ${proxySettings}`);
        response = await axios.default({
          url: publishEndpoint,
          method: 'post',
          data: fileReadStream,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/zip'
          },
          proxy: {
            host: host,
            port: port,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        })
      }
      else {
        response = await axios.default({
          url: publishEndpoint,
          method: 'post',
          data: fileReadStream,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/zip'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }).catch(error => {
          throw error;
        })
      }
      this.logger({
        status: BotProjectDeployLoggerType.DEPLOY_INFO,
        message: response.status,
      });
    } catch (err) {
      // close file read stream
      console.log('%O', err);
      fileReadStream.close();
      if (err.statusCode === 403) {
        throw new Error(
          `Token expired, please run az account get-access-token, then replace the accessToken in your configuration`
        );
      } else {
        throw err;
      }
    }
  }
}
