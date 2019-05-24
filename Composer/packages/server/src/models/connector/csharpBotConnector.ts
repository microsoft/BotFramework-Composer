import fs from 'fs';

import axios from 'axios';
import archiver from 'archiver';

import BotProjectService from '../../services/project';

import { IBotConnector, BotStatus } from './interface';
import FormData from 'form-data';

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

  sync = async () => {
    // archive the project
    // send to bot runtime service
    if (BotProjectService.currentBotProject === undefined) {
      throw new Error('no project is opened, nothing to sync');
    }
    const dir = BotProjectService.currentBotProject.dir;
    await this.archiveDirectory(dir, './tmp.zip');
    const content = fs.readFileSync('./tmp.zip');

    const form = new FormData();
    form.append('file', content, 'bot.zip');
    try {
      await axios.post(this.endpoint + '/api/admin', form, { headers: form.getHeaders() });
    } catch (err) {
      throw new Error(err);
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
