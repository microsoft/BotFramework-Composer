// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import archiver from 'archiver';
import { BotProjectDeploy, BotProjectDeployConfig } from '@bfc/libs/bot-deploy';
import { v4 as uuid } from 'uuid';
import glob from 'globby';
import { copy, emptyDir, readJson, pathExists, writeJson, stat } from 'fs-extra';
import { DeviceTokenCredentials } from '@azure/ms-rest-nodeauth';

interface CreateAndDeployResources {
  name: string;
  location: string;
  environment: string;
  subscriptionID: string;
  // token: string;
  luisAuthoringKey?: string;
  luisAuthoringRegion?: string;
  appPassword: string;
  username: string;
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
  constructor() {
    this.projFolder = path.resolve(__dirname, '../publishBots');
    this.botFolder = path.resolve(__dirname, '../publishBots/ComposerDialogs');
    this.historyFilePath = path.resolve(__dirname, '../publishHistory.txt');
    this.publishingBots = {};
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
    histories[botId][profileName].push(newHistory);
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
  private getLoadingStatus = async (botId: string, profileName: string) => {
    if (this.publishingBots[botId] && this.publishingBots[botId][profileName]) {
      // get current status
      console.log(this.publishingBots[botId][profileName]);
      if (this.publishingBots[botId][profileName].length > 0) {
        return this.publishingBots[botId][profileName][this.publishingBots[botId][profileName].length - 1];
      } else {
        return (
          (await this.getHistory(botId, profileName)[0]) || {
            status: 404,
            result: {
              message: 'bot not published',
            },
          }
        );
      }
    } else {
      return {
        status: 404,
        result: {
          message: 'bot not published',
        },
      };
    }
  };
  private createAndDeploy = async (
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
      await this.azDeployer.createAndDeploy(
        name,
        location,
        environment,
        appPassword,
        luisAuthoringKey,
        luisAuthoringRegion
      );
      // update status and history
      const status = this.removeLoadingStatus(botId, profileName, jobId);
      if (status) {
        console.log(status);
        status.status = 200;
        status.result.message = 'Success';
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
      }
    } catch (error) {
      console.log(error);
      // update status and history
      const status = this.removeLoadingStatus(botId, profileName, jobId);
      if (status) {
        status.status = 500;
        status.result.message = error ? error.message : 'publish error';
        console.log(status);
        await this.updateHistory(botId, profileName, { status: status.status, ...status.result });
      }
    }
  };
  publish = async (config: PublishConfig, project, metadata, user) => {
    const { settings, templatePath, name, customizeConfiguration } = config;
    const { subscriptionID, environment, location, appPassword, username } = customizeConfiguration;
    const srcBot = project.dataDir || '';
    this.templatePath = templatePath;
    const botId = project.id;
    const jobId = uuid();
    try {
      // test creds, if not valid, return 500
      if (!username) {
        const res = {
          status: 500,
          id: jobId,
          time: new Date(),
          message: 'Publish Fail',
          log: 'please input username to login azure cloud',
          comment: metadata.comment,
        };
        // save in history
        await this.updateHistory(botId, name, res);
      }
      // create deploy instance
      if (!this.azDeployer) {
        const creds = new DeviceTokenCredentials('', '', username);
        // console.log(creds);
        this.azDeployer = new BotProjectDeploy({
          subId: subscriptionID,
          logger: (msg: any) => console.log(msg),
          creds: creds,
          projPath: this.projFolder,
        });
      }
      await this.init(srcBot, templatePath);
      console.log('before create');
      this.createAndDeploy(
        botId,
        name,
        jobId,
        customizeConfiguration.name,
        location,
        environment,
        appPassword,
        customizeConfiguration.luisAuthoringKey,
        customizeConfiguration.luisAuthoringRegion
      );

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
      return response;
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        result: {
          id: jobId,
          time: new Date(),
          message: 'Publish Fail',
          log: err.message,
          comment: metadata.comment,
        },
      };
    }
  };

  getStatus = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;
    // return latest status
    return await this.getLoadingStatus(botId, profileName);
  };

  history = async (config: PublishConfig, project, user) => {
    const profileName = config.name;
    const botId = project.id;
    return await this.getHistory(botId, profileName);
  };
}

const azurePublish = new AzurePublisher();

export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(azurePublish);
};
