import { IPublisher, HttpPublisherConfig, PublishResult } from './interface';
import { BotProject } from '../bot/botProject';
import FormData from 'form-data';
import axios from 'axios';
import archiver from 'archiver';
import fs from 'fs';

export class HttpPublisher implements IPublisher {
  constructor(config: HttpPublisherConfig) {
    this.id = config.id;
    this.name = config.name;
    this.endpoint = config.endpoint;
    this.baseUrl = this.endpoint + '/composer/api/v1/';
  }

  id: string;
  name: string;
  endpoint: string;
  private baseUrl: string;

  status = async (): Promise<boolean> => {
    try {
      const result = await axios.get(this.baseUrl + 'status');
      console.log(result.data);
      return true;
    } catch (e) {
      return false;
    }
  };

  publish = async (bot: BotProject, version: string): Promise<PublishResult> => {
    if (bot.files.length == 0) {
      await bot.index();
    }

    const zipFilePath = await this.zipBot(bot);
    const content = fs.readFileSync(zipFilePath);

    const form = new FormData();
    form.append('content', content, 'bot.zip');
    form.append('botID', bot.name);
    form.append('version', version);
    try {
      const result = await axios.post(this.baseUrl + 'publish', form, { headers: form.getHeaders() });
      return result.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  history = async (botID?: string): Promise<PublishResult[]> => {
    try {
      let url = this.baseUrl + 'publishHistory';
      if (botID) {
        url += `?botID=${botID}`;
      }
      const result = await axios.get(url);
      return result.data;
    } catch (err) {
      throw new Error(err);
    }
  };

  rollback = async (botID: string, version: string): Promise<PublishResult> => {
    const result = await axios.post(this.baseUrl + 'rollback' + `?botID=${botID}&version=${version}`);
    return result.data;
  };

  private zipBot(bot: BotProject): Promise<string> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const dest = './tmp.zip';
      const output = fs.createWriteStream(dest);

      archive.pipe(output);
      const files = bot.files;
      for (const f in files) {
        const file = files[f];
        // trim the beginning "ComposerDialogs"
        const name = file.relativePath.startsWith('ComposerDialogs')
          ? file.relativePath.substring(16)
          : file.relativePath;
        archive.append(file.content, { name: name });
      }
      archive.finalize();

      output.on('close', () => resolve(dest));
      archive.on('error', err => reject(err));
    });
  }
}
