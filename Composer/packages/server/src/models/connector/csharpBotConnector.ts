import fs from 'fs';

import axios from 'axios';
import archiver from 'archiver';
import FormData from 'form-data';

import BotProjectService from '../../services/project';
import { DialogSetting } from '../bot/interface';

import { IBotConnector, BotStatus } from './interface';
export class CSharpBotConnector implements IBotConnector {
  private endpoint: string;
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public status: BotStatus = BotStatus.NotConnected;

  connect = async () => {
    // confirm bot runtime is listening here
    try {
      await axios.get(this.endpoint + '/api/admin');
    } catch (err) {
      throw new Error(err);
    }

    this.status = BotStatus.NotConnected;
  };

  sync = async (config: DialogSetting) => {
    // archive the project
    // send to bot runtime service
    if (BotProjectService.currentBotProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    const dir = BotProjectService.currentBotProject.dir;
    await BotProjectService.currentBotProject.luPublisher.setAuthoringKey(config.luis.authoringKey);
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

    // form.append('config', JSON.stringify(luisConfig));
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
      console.log(form);
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
}
