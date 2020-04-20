// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { BotProjectDeploy } from '@bfc/libs/bot-deploy';
import { v4 as uuid, v5 as hash } from 'uuid';
import { copy, emptyDir, readJson, pathExists, writeJson, stat } from 'fs-extra';

interface CreateAndDeployResources {
  name: string;
  location: string;
  environment: string;
  subscriptionID: string;
  luisAuthoringKey?: string;
  luisAuthoringRegion?: string;
  appPassword: string;
  accessToken: string;
  graphToken: string;
}

interface PublishConfig {
  customizeConfiguration: CreateAndDeployResources;
  settings: any;
  templatePath: string;
  name: string; //profile name
}

class AzurePublisher {
  private publishingBots: { [key: string]: any };
  private historyFilePath: string;
  private projFolder: string;
  private botFolder: string;
  private templatePath: string;
  private azDeployer: BotProjectDeploy;
  private resources: { [key: string]: boolean };
  constructor() {
    this.projFolder = path.resolve(__dirname, '../publishBots');
    this.botFolder = path.resolve(__dirname, '../publishBots/ComposerDialogs');
    this.historyFilePath = path.resolve(__dirname, '../publishHistory.txt');
    this.publishingBots = {};
    this.resources = {};
  }

  private init = async (srcBot: string, srcTemplate: string) => {
    // await emptyDir(this.botFolder);
    // await emptyDir(path.resolve(this.projFolder, 'bin')); // empty the release bot
    await emptyDir(this.projFolder);
    // copy bot and runtime into projFolder
    await copy(srcBot, this.botFolder, {
      recursive: true,
    });
    await copy(srcTemplate, this.projFolder);
  };
  private getHistory = async (botId: string, profileName: string) => {
    if (await pathExists(this.historyFilePath)) {
      const histories = await readJson(this.historyFilePath);
      if (histories && histories[botId] && histories[botId][profileName]) {
        return histories[botId][profileName];
      }
    }
    return [];
  };
  private updateHistory = async (botId: string, profileName: string, newHistory: any) => {
    let histories = {};
    if (await pathExists(this.historyFilePath)) {
      histories = (await readJson(this.historyFilePath)) || {};
    }
    if (!histories[botId]) {
      histories[botId] = {};
    }
    if (!histories[botId][profileName]) {
      histories[botId][profileName] = [];
    }
    histories[botId][profileName].unshift(newHistory);
    await writeJson(this.historyFilePath, histories);
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
      const index = this.publishingBots[botId][profileName].findIndex(item => item.result.id === jobId);
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
        return this.publishingBots[botId][profileName].find(item => item.result.id === jobId);
      }
      return this.publishingBots[botId][profileName][this.publishingBots[botId][profileName].length - 1];
    }
    return undefined;
  };
  private createAndDeploy = async (
    subscriptionID: string,
    botId: string,
    profileName: string,
    jobId: string,
    name: string,
    location: string,
    environment: string,
    appPassword: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string
  ) => {
    try {
      // if create resource success, we do not create again. recreate resource with the same config may cause error.
      const key = hash([name, location, environment, appPassword, luisAuthoringKey], subscriptionID);
      if (!this.resources[key]) {
        const createSuccess = await this.azDeployer.create(name, location, environment, appPassword, luisAuthoringKey);
        if (!createSuccess) {
          throw new Error('create resource fail');
        }
        this.resources[key] = true;
      }
      await this.azDeployer.deploy(name, environment, luisAuthoringKey, luisAuthoringRegion);

      // update status and history
      const status = this.getLoadingStatus(botId, profileName, jobId);

      if (status) {
        status.status = 200;
        status.result.message = 'Success';
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
        this.removeLoadingStatus(botId, profileName, jobId);
      }
    } catch (error) {
      console.log(error);
      // update status and history
      const status = this.getLoadingStatus(botId, profileName, jobId);
      if (status) {
        status.status = 500;
        status.result.message = error ? error.message : 'publish error';
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
        this.removeLoadingStatus(botId, profileName, jobId);
      }
    }
  };
  publish = async (config: PublishConfig, project, metadata, user) => {
    const { settings, templatePath, name, customizeConfiguration } = config;
    const {
      subscriptionID,
      environment,
      location,
      appPassword,
      accessToken,
      graphToken,
      luisAuthoringKey,
      luisAuthoringRegion,
    } = customizeConfiguration;
    const srcBot = project.dataDir || '';
    this.templatePath = templatePath;
    const botId = project.id;
    const publishName = customizeConfiguration.name;
    const jobId = uuid();
    try {
      // test creds, if not valid, return 500
      if (!accessToken || !graphToken) {
        throw new Error('please input token to login azure cloud');
      }
      // in order to update creds and subId
      this.azDeployer = new BotProjectDeploy({
        subId: subscriptionID,
        logger: (msg: any) => {
          console.log(msg);
        },
        accessToken: accessToken,
        graphToken: graphToken,
        projPath: this.projFolder,
      });
      await this.init(srcBot, templatePath);

      const response = {
        status: 202,
        result: {
          id: jobId,
          time: new Date(),
          message: 'Accepted for publishing.',
          log: 'Publish starting...',
          comment: metadata.comment,
        },
      };
      this.addLoadingStatus(botId, name, response);

      this.createAndDeploy(
        subscriptionID,
        botId,
        name,
        jobId,
        publishName,
        location,
        environment,
        appPassword,
        luisAuthoringKey,
        luisAuthoringRegion
      );

      return response;
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        result: {
          id: jobId,
          time: new Date(),
          message: 'Publish Fail',
          log: err.message,
          comment: metadata.comment,
        },
      };
      this.updateHistory(botId, name, { status: res.status, ...res.result });
      return res;
    }
  };

  getStatus = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
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

  history = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;
    return await this.getHistory(botId, profileName);
  };

  // default value to show in Add profile dialog
  configuration = {
    subscriptionID: '<your subscription id>',
    appPassword: '<16 characters including uppercase, lowercase, number and special character>',
    name: '<unique name in your subscription>',
    environment: 'composer',
    location: 'westus',
    luisAuthoringRegion: 'westus',
    graphToken:
      '<run az account get-access-token --resource-type aad-graph in command line and replace it with accessToken>',
    accessToken: '<run az account get-access-token in command line and replace it with accessToken>',
  };
}

const azurePublish = new AzurePublisher();

export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(azurePublish);
};
