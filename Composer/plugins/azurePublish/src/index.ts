// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { BotProjectDeploy } from '@bfc/libs/bot-deploy';
import { v4 as uuid, v5 as hash } from 'uuid';
import { copy, emptyDir, readJson, pathExists, writeJson, mkdirSync, pathExistsSync } from 'fs-extra';
import { DeviceTokenCredentials } from '@azure/ms-rest-nodeauth';
import { MemoryCache } from 'adal-node';

import schema from './schema';
const _cache = new MemoryCache();

interface CreateAndDeployResources {
  name: string;
  location: string;
  environment: string;
  subscriptionID: string;
  luisAuthoringKey?: string;
  luisAuthoringRegion?: string;
  appPassword: string;
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
  private credsFile: string;
  private provisionResource: string;
  private azDeployer: BotProjectDeploy;
  private resources: { [key: string]: boolean };
  constructor() {
    this.historyFilePath = path.resolve(__dirname, '../publishHistory.txt');
    this.provisionResource = path.resolve(__dirname, '../provisionResult.json');
    this.credsFile = path.resolve(__dirname, '../cred.txt');
    this.publishingBots = {};
    this.resources = {};
  }
  private getProjectFolder = (key: string) => path.resolve(__dirname, `../publishBots/${key}`);
  private getBotFolder = (key: string) => path.resolve(this.getProjectFolder(key));
  private getRuntimeFolder = (key: string) => path.resolve(this.getProjectFolder(key), 'runtime');
  private init = async (srcBot: string, srcTemplate: string, resourcekey: string, currentProvision: any) => {
    const exist = await pathExists(this.getProjectFolder(resourcekey));
    const botFolder = this.getBotFolder(resourcekey);
    const projFolder = this.getProjectFolder(resourcekey);
    // deploy resource exist
    if (!exist) {
      mkdirSync(projFolder, { recursive: true });
    }
    await emptyDir(projFolder);
    // copy bot and runtime into projFolder
    await copy(srcBot, botFolder, {
      recursive: true,
    });
    await copy(srcTemplate, projFolder);
    const resourcePath = path.resolve(projFolder, 'appsettings.deployment.json');
    await writeJson(resourcePath, currentProvision, {
      spaces: 4,
    });
    // TODO: this needs to be remote storage aware
    // remember the project's project.files not include the settings.json file, need to change the indexer in client
    // and save the project.files contents instead of copy
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
    resourcekey: string,
    botId: string,
    profileName: string,
    jobId: string,
    customizeConfiguration: CreateAndDeployResources
  ) => {
    const { name, location, environment, appPassword, luisAuthoringKey, luisAuthoringRegion } = customizeConfiguration;
    try {
      // Perform the deploy
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

  /**************************************************************************************************
   * plugin methods
   *************************************************************************************************/
  publish = async (config: PublishConfig, project, metadata, user) => {
    // templatePath point to the CSharp code
    const { settings, templatePath, name, customizeConfiguration } = config;
    const {
      subscriptionID,
      environment,
      location,
      appPassword,
      luisAuthoringKey,
      luisAuthoringRegion,
    } = customizeConfiguration;

    // point to the declarative assets (possibly in remote storage)
    // TODO: this should definitely be using project.files instead of the path
    const srcBot = project.dataDir || '';

    // get the bot id from the project
    const botId = project.id;

    // get the name of the publish profile
    const publishName = customizeConfiguration.name;

    // generate an id to track this deploy
    const jobId = uuid();

    // resource key to map to one provision resource
    const resourcekey = hash(
      [publishName, location, environment, appPassword, luisAuthoringKey, luisAuthoringRegion],
      subscriptionID
    );
    try {
      // test creds, if not valid, return 500
      if (!(await pathExists(this.credsFile))) {
        throw new Error('please input token to login azure cloud');
      }
      if (!(await pathExists(this.provisionResource))) {
        throw new Error('please do the provision first');
      }
      const provisions = await readJson(this.provisionResource);
      const currentProvision = provisions[resourcekey];
      if (!currentProvision) {
        throw new Error(
          'no successful created resource in Azure according to your config, please do the provision again'
        );
      }
      const credsFromFile = await readJson(this.credsFile);

      if (credsFromFile.tokenCache && credsFromFile.tokenCache._entries) {
        _cache.add(credsFromFile.tokenCache._entries, (err, result) => {
          console.log(err);
          console.log(result);
        });
      }
      const creds = new DeviceTokenCredentials(
        credsFromFile.clientId,
        credsFromFile.domain,
        credsFromFile.username,
        credsFromFile.tokenAudience,
        credsFromFile.environment,
        _cache
      );
      this.azDeployer = new BotProjectDeploy({
        subId: subscriptionID,
        logger: (msg: any) => {
          console.log(msg);
        },
        creds: creds,
        projPath: this.getProjectFolder(resourcekey),
      });
      await this.init(srcBot, templatePath, resourcekey, currentProvision);

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

      this.createAndDeploy(resourcekey, botId, name, jobId, customizeConfiguration);

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
}

const azurePublish = new AzurePublisher();

export default async (composer: any): Promise<void> => {
  // pass in the custom storage class that will override the default
  await composer.addPublishMethod(azurePublish, schema);
};
