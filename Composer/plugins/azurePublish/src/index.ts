// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { BotProjectDeploy } from '@bfc/botframeworkdeploy';
import { v4 as uuid } from 'uuid';
import md5 from 'md5';
import { copy, rmdir, emptyDir, readJson, pathExists, writeJson, mkdirSync, writeFileSync } from 'fs-extra';
import { IBotProject } from '@bfc/shared';

import schema from './schema';
// This option controls whether the history is serialized to a file between sessions with Composer
// set to TRUE for history to be saved to disk
// set to FALSE for history to be cached in memory only
const PERSIST_HISTORY = false;
const DEFAULT_RUNTIME = 'azurewebapp';

const instructions = `To create a publish configuration, follow the instructions in the README file in your bot project folder.`;

interface CreateAndDeployResources {
  name: string;
  environment: string;
  hostname?: string;
  luisResource?: string;
  subscriptionID: string;
  language?: string;
}

interface PublishConfig {
  fullSettings: any;
  templatePath: string;
  profileName: string; //profile name
  [key: string]: any;
}

class AzurePublisher {
  private publishingBots: { [key: string]: any };
  private historyFilePath: string;
  private histories: any;
  private azDeployer: BotProjectDeploy;
  private logMessages: any[];
  constructor() {
    this.histories = {};
    this.historyFilePath = path.resolve(__dirname, '../publishHistory.txt');
    if (PERSIST_HISTORY) {
      this.loadHistoryFromFile();
    }
    this.publishingBots = {};
    this.logMessages = [];
  }

  private baseRuntimeFolder = process.env.AZURE_PUBLISH_PATH || path.resolve(__dirname, `publishBots`);

  private getRuntimeFolder = (key: string) => {
    return path.resolve(this.baseRuntimeFolder, `${key}`);
  };
  private getProjectFolder = (key: string, template: string) => {
    return path.resolve(this.baseRuntimeFolder, `${key}/${template}`);
  };
  private getBotFolder = (key: string, template: string) =>
    path.resolve(this.getProjectFolder(key, template), 'ComposerDialogs');
  private getSettingsPath = (key: string, template: string) =>
    path.resolve(this.getBotFolder(key, template), 'settings/appsettings.json');
  private getManifestDstDir = (key: string, template: string) =>
    path.resolve(this.getProjectFolder(key, template), 'wwwroot');

  private init = async (botFiles: any, settings: any, srcTemplate: string, resourcekey: string) => {
    const runtimeExist = await pathExists(this.getRuntimeFolder(resourcekey));
    const botExist = await pathExists(this.getBotFolder(resourcekey, DEFAULT_RUNTIME));
    const botFolder = this.getBotFolder(resourcekey, DEFAULT_RUNTIME);
    const runtimeFolder = this.getRuntimeFolder(resourcekey);
    const settingsPath = this.getSettingsPath(resourcekey, DEFAULT_RUNTIME);
    const manifestPath = this.getManifestDstDir(resourcekey, DEFAULT_RUNTIME);
    // deploy resource exist
    await emptyDir(runtimeFolder);
    if (!runtimeExist) {
      mkdirSync(runtimeFolder, { recursive: true });
    }
    if (!botExist) {
      mkdirSync(botFolder, { recursive: true });
    }
    // save bot files and manifest files
    for (const file of botFiles) {
      const pattern = /manifests\/[0-9A-z-]*.json/;
      let filePath;
      if (file.relativePath.match(pattern)) {
        // save manifest files into wwwroot
        filePath = path.resolve(manifestPath, file.relativePath);
      } else {
        // save bot files
        filePath = path.resolve(botFolder, file.relativePath);
      }
      if (!(await pathExists(path.dirname(filePath)))) {
        mkdirSync(path.dirname(filePath), { recursive: true });
      }
      writeFileSync(filePath, file.content);
    }

    // save the settings file
    if (!(await pathExists(path.dirname(settingsPath)))) {
      mkdirSync(path.dirname(settingsPath), { recursive: true });
    }
    await writeJson(settingsPath, settings, { spaces: 4 });
    // copy bot and runtime into projFolder
    await copy(srcTemplate, runtimeFolder);
  };

  private async cleanup(resourcekey: string) {
    const projFolder = this.getRuntimeFolder(resourcekey);
    await emptyDir(projFolder);
    await rmdir(projFolder);
  }

  private async loadHistoryFromFile() {
    if (await pathExists(this.historyFilePath)) {
      this.histories = await readJson(this.historyFilePath);
    }
  }

  private getHistory = async (botId: string, profileName: string) => {
    if (this.histories && this.histories[botId] && this.histories[botId][profileName]) {
      return this.histories[botId][profileName];
    }
    return [];
  };

  private updateHistory = async (botId: string, profileName: string, newHistory: any) => {
    if (!this.histories[botId]) {
      this.histories[botId] = {};
    }
    if (!this.histories[botId][profileName]) {
      this.histories[botId][profileName] = [];
    }
    this.histories[botId][profileName].unshift(newHistory);
    if (PERSIST_HISTORY) {
      await writeJson(this.historyFilePath, this.histories);
    }
  };

  private addLoadingStatus = (botId: string, profileName: string, newStatus) => {
    // save in publishingBots
    if (!this.publishingBots[botId]) {
      this.publishingBots[botId] = {};
    }
    if (!this.publishingBots[botId][profileName]) {
      this.publishingBots[botId][profileName] = [];
    }
    this.publishingBots[botId][profileName].push(newStatus);
  };
  private removeLoadingStatus = (botId: string, profileName: string, jobId: string) => {
    if (this.publishingBots[botId] && this.publishingBots[botId][profileName]) {
      const index = this.publishingBots[botId][profileName].findIndex((item) => item.result.id === jobId);
      const status = this.publishingBots[botId][profileName][index];
      this.publishingBots[botId][profileName] = this.publishingBots[botId][profileName]
        .slice(0, index)
        .concat(this.publishingBots[botId][profileName].slice(index + 1));
      return status;
    }
    return;
  };
  private getLoadingStatus = (botId: string, profileName: string, jobId = '') => {
    if (this.publishingBots[botId] && this.publishingBots[botId][profileName].length > 0) {
      // get current status
      if (jobId) {
        return this.publishingBots[botId][profileName].find((item) => item.result.id === jobId);
      }
      return this.publishingBots[botId][profileName][this.publishingBots[botId][profileName].length - 1];
    }
    return undefined;
  };

  private createAndDeploy = async (
    botId: string,
    profileName: string,
    jobId: string,
    resourcekey: string,
    customizeConfiguration: CreateAndDeployResources
  ) => {
    const { name, environment, hostname, luisResource, language } = customizeConfiguration;
    try {
      // Perform the deploy
      await this.azDeployer.deploy(name, environment, null, null, null, language, hostname, luisResource);

      // update status and history
      const status = this.getLoadingStatus(botId, profileName, jobId);

      if (status) {
        status.status = 200;
        status.result.message = 'Success';
        status.result.log = this.logMessages.join('\n');
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
        this.removeLoadingStatus(botId, profileName, jobId);
        await this.cleanup(resourcekey);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        this.logMessages.push(error.message);
      } else if (typeof error === 'object') {
        this.logMessages.push(JSON.stringify(error));
      } else {
        this.logMessages.push(error);
      }
      // update status and history
      const status = this.getLoadingStatus(botId, profileName, jobId);
      if (status) {
        status.status = 500;
        status.result.message = this.logMessages[this.logMessages.length - 1];
        status.result.log = this.logMessages.join('\n');
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
        this.removeLoadingStatus(botId, profileName, jobId);
        await this.cleanup(resourcekey);
      }
    }
  };

  /**************************************************************************************************
   * plugin methods
   *************************************************************************************************/
  publish = async (config: PublishConfig, project: IBotProject, metadata, user) => {
    // templatePath point to the dotnet code
    const {
      // these are provided by Composer
      fullSettings,
      templatePath,
      profileName,

      // these are specific to the azure publish profile shape
      subscriptionID,
      name,
      environment,
      hostname,
      luisResource,
      language,
      settings,
      accessToken,
    } = config;

    // point to the declarative assets (possibly in remote storage)
    const botFiles = project.getProject().files;

    // get the bot id from the project
    const botId = project.id;

    // generate an id to track this deploy
    const jobId = uuid();

    // resource key to map to one provision resource
    const resourcekey = md5([project.name, name, environment, settings?.MicrosoftAppPassword].join());

    // If the project is using an "ejected" runtime, use that version of the code instead of the built-in template
    let runtimeCodePath = templatePath;
    if (
      project.settings &&
      project.settings.runtime &&
      project.settings.runtime.customRuntime === true &&
      project.settings.runtime.path
    ) {
      runtimeCodePath = project.settings.runtime.path;
    }

    await this.init(botFiles, fullSettings, runtimeCodePath, resourcekey);

    try {
      // test creds, if not valid, return 500
      if (!accessToken) {
        throw new Error('Required field `accessToken` is missing from publishing profile.');
      }
      if (!settings) {
        throw new Error(
          'no successful created resource in Azure according to your config, please run provision script included in your bot project.'
        );
      }

      const customizeConfiguration: CreateAndDeployResources = {
        subscriptionID,
        name,
        environment,
        hostname,
        luisResource,
        language,
      };

      // append provision resource into file
      // TODO: here is where we configure the template for the runtime, and should be parameterized when we
      // implement interchangeable runtimes
      const resourcePath = path.resolve(
        this.getProjectFolder(resourcekey, DEFAULT_RUNTIME),
        'appsettings.deployment.json'
      );
      const appSettings = await readJson(resourcePath);
      await writeJson(
        resourcePath,
        { ...appSettings, ...settings },
        {
          spaces: 4,
        }
      );

      this.azDeployer = new BotProjectDeploy({
        subId: subscriptionID,
        logger: (msg: any) => {
          console.log(msg);
          this.logMessages.push(JSON.stringify(msg, null, 2));
        },
        accessToken: accessToken,
        projPath: this.getProjectFolder(resourcekey, 'azurewebapp'),
      });

      this.logMessages = ['Publish starting...'];
      const response = {
        status: 202,
        result: {
          id: jobId,
          time: new Date(),
          message: 'Accepted for publishing.',
          log: this.logMessages.join('\n'),
          comment: metadata.comment,
        },
      };
      this.addLoadingStatus(botId, profileName, response);

      this.createAndDeploy(botId, profileName, jobId, resourcekey, customizeConfiguration);

      return response;
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        this.logMessages.push(err.message);
      } else if (typeof err === 'object') {
        this.logMessages.push(JSON.stringify(err));
      } else {
        this.logMessages.push(err);
      }
      const response = {
        status: 500,
        result: {
          id: jobId,
          time: new Date(),
          message: this.logMessages[this.logMessages.length - 1],
          log: this.logMessages.join('\n'),
          comment: metadata.comment,
        },
      };
      this.updateHistory(botId, profileName, { status: response.status, ...response.result });
      this.cleanup(resourcekey);
      return response;
    }
  };

  getStatus = async (config: PublishConfig, project: IBotProject, user) => {
    const profileName = config.profileName;
    const botId = project.id;
    // return latest status
    const status = this.getLoadingStatus(botId, profileName);
    if (status) {
      return status;
    } else {
      const current = await this.getHistory(botId, profileName);
      if (current.length > 0) {
        return { status: current[0].status, result: { ...current[0] } };
      }
      return {
        status: 404,
        result: {
          message: 'bot not published',
        },
      };
    }
  };

  history = async (config: PublishConfig, project: IBotProject, user) => {
    const profileName = config.profileName;
    const botId = project.id;
    return await this.getHistory(botId, profileName);
  };
}

const azurePublish = new AzurePublisher();

export default async (composer: any): Promise<void> => {
  await composer.addPublishMethod(azurePublish, schema, instructions);
};
