// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import Path from 'path';

import axios from 'axios';
import archiver from 'archiver';
import FormData from 'form-data';

import { BotProjectService } from '../../services/project';
import { DialogSetting } from '../bot/interface';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishHistory } from './interface';

export class CSharpBotConnector implements IBotConnector {
  private adminEndpoint: string;
  private endpoint: string;
  constructor(adminEndpoint: string, endpoint: string) {
    this.adminEndpoint = adminEndpoint;
    this.endpoint = endpoint;
  }

  public status: BotStatus = BotStatus.NotConnected;

  connect = async (_: BotEnvironments, __: string) => {
    // confirm bot runtime is listening here
    try {
      await axios.get(this.adminEndpoint + '/api/admin');
    } catch (err) {
      throw new Error(err);
    }

    this.status = BotStatus.NotConnected;

    return `${this.endpoint}/api/messages`;
  };

  sync = async (config: DialogSetting) => {
    // archive the project
    // send to bot runtime service
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    const dir = Path.join(currentProject.dataDir);
    const luisConfig = currentProject.luPublisher.getLuisConfig();
    await this.archiveDirectory(dir, './tmp.zip');
    const content = fs.readFileSync('./tmp.zip');

    const form = new FormData();
    form.append('file', content, 'bot.zip');

    if (luisConfig && luisConfig.authoringKey !== null && !currentProject.checkLuisPublished()) {
      throw new Error('Please publish your Luis models');
    }

    if (luisConfig) {
      form.append('endpointKey', luisConfig.endpointKey || luisConfig.authoringKey || '');
    }

    config = {
      ...(await currentProject.settingManager.get(currentProject.environment.getDefaultSlot(), false)),
      ...config,
    };
    if (config.MicrosoftAppPassword) {
      form.append('microsoftAppPassword', config.MicrosoftAppPassword);
    }
    try {
      await axios.post(this.adminEndpoint + '/api/admin', form, { headers: form.getHeaders() });
    } catch (err) {
      throw new Error('Unable to sync content to bot runtime');
    }
  };

  archiveDirectory = (src: string, dest: string) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dest);

      archive.pipe(output);
      archive.directory(src, false);
      archive.finalize();

      output.on('close', () => resolve(archive));
      archive.on('error', err => reject(err));
    });
  };

  getEditingStatus = (): Promise<boolean> => {
    return new Promise(resolve => {
      resolve(true);
    });
  };

  getPublishHistory = (): Promise<IPublishHistory> => {
    return new Promise(resolve => {
      resolve({
        production: undefined,
        previousProduction: undefined,
        integration: undefined,
      });
    });
  };

  publish = (_: BotConfig, __: string): Promise<void> => {
    return new Promise(resolve => {
      resolve();
    });
  };
}
