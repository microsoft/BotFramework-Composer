import fs from 'fs';

import axios from 'axios';
import archiver from 'archiver';
import FormData from 'form-data';

import BotProjectService from '../../services/project';
import { DialogSetting } from '../bot/interface';

import { BotConfig, BotEnvironments, BotStatus, IBotConnector, IPublishVersion } from './interface';

export class CSharpBotConnector implements IBotConnector {
  private endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public status: BotStatus = BotStatus.NotConnected;

  connect = async (_: BotEnvironments, __: string) => {
    // confirm bot runtime is listening here
    try {
      await axios.get(this.endpoint + '/api/admin');
    } catch (err) {
      throw new Error(err);
    }

    this.status = BotStatus.NotConnected;

    return `${this.endpoint}/api/messages`;
  };

  sync = async (config: DialogSetting) => {
    // archive the project
    // send to bot runtime service
    if (BotProjectService.currentBotProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    const dir = BotProjectService.currentBotProject.dir;
    const luisConfig = BotProjectService.currentBotProject.luPublisher.getLuisConfig();
    await this.archiveDirectory(dir, './tmp.zip');
    const content = fs.readFileSync('./tmp.zip');

    const form = new FormData();
    form.append('file', content, 'bot.zip');

    if (
      luisConfig &&
      luisConfig.authoringKey !== null &&
      !(await BotProjectService.currentBotProject.checkLuisPublished())
    ) {
      throw new Error('Please publish your Luis models');
    }

    if (luisConfig) {
      form.append(
        'endpointKey',
        luisConfig.endpointKey && luisConfig.endpointKey !== '' ? luisConfig.endpointKey : luisConfig.authoringKey
      );
    }

    config = { ...(await BotProjectService.currentBotProject.settingManager.get()), ...config };
    if (config.MicrosoftAppPassword) {
      form.append('microsoftAppPassword', config.MicrosoftAppPassword);
    }
    try {
      await axios.post(this.endpoint + '/api/admin', form, { headers: form.getHeaders() });
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

  getPublishVersions = (): Promise<IPublishVersion[]> => {
    return new Promise(resolve => {
      resolve([]);
    });
  };

  publish = (config: BotConfig, label: string): Promise<void> => {
    return new Promise(resolve => {
      resolve();
    });
  };
}
