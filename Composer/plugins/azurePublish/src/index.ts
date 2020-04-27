// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import { BotProjectDeploy } from '@bfc/libs/bot-deploy';
import { v4 as uuid, v5 as hash } from 'uuid';
import { copy, emptyDir, readJson, pathExists, writeJson, mkdirSync, writeFileSync } from 'fs-extra';
import { DeviceTokenCredentials } from '@azure/ms-rest-nodeauth';
import { MemoryCache } from 'adal-node';

import schema from './schema';
const _cache = new MemoryCache();
interface CreateAndDeployResources {
  publishName: string;
  location: string;
  environment: string;
  subscriptionID: string;
  luisAuthoringKey?: string;
  luisAuthoringRegion?: string;
  appPassword: string;
}

interface PublishConfig {
  settings: any;
  templatePath: string;
  name: string; //profile name
  [key: string]: any;
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
  private getBotFolder = (key: string) => path.resolve(this.getProjectFolder(key), 'ComposerDialogs');
  private getSettingsPath = (key: string) => path.resolve(this.getBotFolder(key), 'settings/appsettings.json');
  private init = async (botFiles: any, settings: any, srcTemplate: string, resourcekey: string) => {
    const projExist = await pathExists(this.getProjectFolder(resourcekey));
    const botExist = await pathExists(this.getBotFolder(resourcekey));
    const botFolder = this.getBotFolder(resourcekey);
    const projFolder = this.getProjectFolder(resourcekey);
    const settingsPath = this.getSettingsPath(resourcekey);
    // deploy resource exist
    await emptyDir(projFolder);
    if (!projExist) {
      mkdirSync(projFolder, { recursive: true });
    }
    if (!botExist) {
      mkdirSync(botFolder, { recursive: true });
    }
    // save bot files
    for (const file of botFiles) {
      const filePath = path.resolve(botFolder, file.relativePath);
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
    await copy(srcTemplate, projFolder);
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
    const {
      publishName,
      location,
      environment,
      appPassword,
      luisAuthoringKey,
      luisAuthoringRegion,
    } = customizeConfiguration;
    try {
      // Perform the deploy
      await this.azDeployer.deploy(publishName, environment, luisAuthoringKey, luisAuthoringRegion);

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
    const {
      settings,
      templatePath,
      name,
      subscriptionID,
      publishName,
      environment,
      location,
      appPassword,
      luisAuthoringKey,
      luisAuthoringRegion,
    } = config;

    const customizeConfiguration: CreateAndDeployResources = {
      subscriptionID,
      publishName,
      environment,
      location,
      appPassword,
      luisAuthoringKey,
      luisAuthoringRegion,
    };
    // point to the declarative assets (possibly in remote storage)
    const botFiles = project.files;

    // get the bot id from the project
    const botId = project.id;

    // generate an id to track this deploy
    const jobId = uuid();

    // resource key to map to one provision resource
    const resourcekey = hash(
      [subscriptionID, publishName, location, environment, appPassword, luisAuthoringKey, luisAuthoringRegion],
      subscriptionID
    );

    await this.init(botFiles, settings, templatePath, resourcekey);

    try {
      const profile = settings.publishTargets?.find(item => item.name === name);
      // test creds, if not valid, return 500
      if (!profile || !profile.credential) {
        throw new Error('please run Login script to login azure cloud');
      }
      if (!profile || !profile.provision) {
        throw new Error('please run provision script to do the provision');
      }
      const currentProvision = profile.provision;
      if (!currentProvision) {
        throw new Error(
          'no successful created resource in Azure according to your config, please do the provision again'
        );
      }
      // append provision resource into file
      const resourcePath = path.resolve(this.getProjectFolder(resourcekey), 'appsettings.deployment.json');
      const appSettings = await readJson(resourcePath);
      await writeJson(
        resourcePath,
        { ...appSettings, ...currentProvision },
        {
          spaces: 4,
        }
      );
      const credential = profile.credential;

      if (credential.tokenCache && credential.tokenCache._entries) {
        _cache.add(credential.tokenCache._entries, (err, result) => {
          console.log(err);
          console.log(result);
        });
      }
      const creds = new DeviceTokenCredentials(
        credential.clientId,
        credential.domain,
        credential.username,
        credential.tokenAudience,
        credential.environment,
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
