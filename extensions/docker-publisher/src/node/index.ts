// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import {
  PublishPlugin,
  IExtensionRegistration,
  IBotProject,
  PublishResult,
  PublishResponse,
} from '@botframework-composer/types';
import { pathExists, readJson, writeJson } from 'fs-extra';

import { RegistryConfigData, ConfigSettings } from '../types';
import { DockerContext, Status, Steps } from '../types/dockerTypes';

import { DockerEngines, IEngine } from './engines';

type PublishConfig = {
  profileName: string;
  target: RegistryConfigData;
  fullSettings: any;
};

const PERSIST_HISTORY = true;

export default async (composer: IExtensionRegistration): Promise<void> => {
  class DockerPublisher implements PublishPlugin<PublishConfig> {
    private readonly composer: IExtensionRegistration;

    private readonly baseDir = path.resolve(__dirname, '../');
    private readonly assetsDir = path.resolve(this.baseDir, 'assets');

    public readonly name: string;
    public readonly description: string;
    public readonly bundleId: string;
    private dockerEngine: IEngine;

    private publishHistories: Record<string, PublishResult[]>;
    private historyFilePath: string;

    private currentStatus: Status = {
      status: -1,
      message: '',
      log: {},
    };

    private logger = (step: string, message: string, status?: number) => {
      this.currentStatus.status = status;
      this.currentStatus.message = message;
      if (!this.currentStatus.log[step]) {
        this.currentStatus.log[step] = [];
      }
      this.currentStatus.log[step].push(message);

      composer.log({
        status: step,
        message: message,
      });
    };

    /*******************************************************************************************************************************/
    /* These methods deal with the publishing history displayed in the Composer UI */
    /*******************************************************************************************************************************/
    private updateHistory = async (profileName: string, newHistory: PublishResult) => {
      if (!this.publishHistories) {
        this.publishHistories = {};
      }
      if (!this.publishHistories[profileName]) {
        this.publishHistories[profileName] = [];
      }
      this.publishHistories[profileName].unshift(newHistory);

      if (PERSIST_HISTORY) {
        await writeJson(this.historyFilePath, this.publishHistories);
      }
    };
    private loadHistoryFromFile = async () => {
      if (await pathExists(this.historyFilePath)) {
        this.publishHistories = await readJson(this.historyFilePath);
      }
    };

    constructor(name: string, description: string, bundleId: string) {
      this.name = name;
      this.description = description;
      this.bundleId = bundleId;

      this.publishHistories = {};
      this.historyFilePath = path.resolve(__dirname, '../../publishHistory.txt');
      if (PERSIST_HISTORY) {
        this.loadHistoryFromFile();
      }
    }

    /*******************************************************************************************************************************/
    /* These methods deal with image building and publishing */
    /*******************************************************************************************************************************/
    private startPublishing = async (settings: ConfigSettings) => {
      const dockerContext: DockerContext = {
        ...settings,
        dockerfile: path.resolve(this.assetsDir, 'Dockerfile'),
        imageName: this.dockerEngine.mountImageName(settings),
        registry: settings.url,
        logger: (stdout, stderr) => {
          this.logger(stdout, stderr);
        },
      };

      try {
        await this.buildImage(dockerContext);
      } catch (err) {
        this.logger(Steps.BUILD_IMAGE, err, 500);
        return;
      }

      try {
        await this.pushImage(dockerContext);
      } catch (err) {
        this.logger(Steps.PUSH_IMAGE, err, 500);
        return;
      }

      try {
        await this.verifyImageCreation(dockerContext);
      } catch (err) {
        this.logger(Steps.VERIFY_IMAGE, err, 500);
        return;
      }
    };

    private buildImage = async (dockerContext: DockerContext) => {
      this.logger(Steps.BUILD_IMAGE, 'Starting');
      const { stdout, stderr } = await this.dockerEngine.buildImage(dockerContext);

      if (stderr) {
        this.logger(Steps.BUILD_IMAGE, stderr, 500);
      }

      stdout.split('\n').map((line) => this.logger(Steps.BUILD_IMAGE, line, 200));
    };

    private pushImage = async (dockerContext: DockerContext) => {
      this.logger(Steps.PUSH_IMAGE, 'Starting');

      const { stdout, stderr } = await this.dockerEngine.push(dockerContext);

      if (!stderr) {
        stdout.split('\n').map((line) => this.logger(Steps.PUSH_IMAGE, line, 200));
      }
    };

    private verifyImageCreation = async (dockerContext: DockerContext) => {
      this.logger(Steps.VERIFY_IMAGE, 'Starting');
      const success = await this.dockerEngine.verify(dockerContext);

      if (success) {
        this.logger(Steps.VERIFY_IMAGE, `Image '${dockerContext.imageName}' created succesfully`, 200);
      } else {
        this.logger(Steps.VERIFY_IMAGE, 'Failed to verify image', 500);
      }
    };

    /*******************************************************************************************************************************/
    /* These methods come from the interface */
    /*******************************************************************************************************************************/
    getHistory = async (config: PublishConfig, project: IBotProject): Promise<PublishResult[]> => {
      const profileName = config.profileName;

      if (this.publishHistories?.[profileName]) {
        return this.publishHistories[profileName];
      }

      return [];
    };

    publish = async (config: PublishConfig, project, metadata, user): Promise<any> => {
      const { target, profileName } = config;

      this.dockerEngine = DockerEngines.Factory(target.creationType);

      const mergedSettings: ConfigSettings = {
        ...target,
        botId: project.id,
        botPath: path.resolve(project.dir, '..'),
        botName: project.name,
      };

      await this.startPublishing(mergedSettings);
      this.logger(
        Steps.FINISHING,
        `To start the container, use the following command: ${this.buildRunCommand(
          this.dockerEngine.mountImageName(mergedSettings)
        )}`,
        200
      );

      await this.updateHistory(profileName, this.publishResultFromStatus().result);

      return this.publishResultFromStatus();
    };

    /*******************************************************************************************************************************/
    /* These methods are helpers */
    /*******************************************************************************************************************************/
    private publishResultFromStatus(): PublishResponse {
      return {
        status: this.currentStatus.status,
        result: {
          message: this.currentStatus.message,
          status: this.currentStatus.status,
          log: this.parseLogToString(),
          time: new Date().toString(),
        },
      };
    }
    private parseLogToString(): string {
      let str = '';
      for (const k in this.currentStatus.log) {
        str += `---\n${k}:\n${this.currentStatus.log[k]
          .map((item) => `  ${JSON.stringify(item, null, 2)}`)
          .join('\n')}\n\n`;
      }

      return str;
    }
    private buildRunCommand(imageName: string): string {
      const args: string[] = [];

      args.push('docker');
      args.push('run');
      args.push('--port 80:80');
      args.push('--port 443:443');
      args.push('--port 5000:5000');
      args.push('--port 5001:5001');

      args.push('--env "MicrosoftAppId=<YOUR MICROSOFT APP ID>"');
      args.push('--env "LuisEnpointKey=<YOUR LUIS ENDPOINT KEY>"');
      args.push('--env "QnAEnpointKey=<YOUR QNA ENDPOINT KEY>"');
      args.push('--env "SkillHostEndpoint=<YOUR SKILL HOST ENDPOINT>"');

      args.push(imageName);

      return args.join(' ');
    }
  }

  const publisher = new DockerPublisher('dockerPublish', 'Publish bot to Docker Images', 'dockerPublish');
  await composer.addPublishMethod(publisher);
};
