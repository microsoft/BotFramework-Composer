// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import axios from 'axios';
import archiver from 'archiver';
import FormData from 'form-data';
import { FileInfo } from '@bfc/indexers';

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
    // call .index() in order to load all the files from storage into memory
    await currentProject.index();
    const luisConfig = currentProject.luPublisher.getLuisConfig();
    await this.createZipFromFiles(currentProject.files, './tmp.zip');
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

  /**
   * given an array of FileInfo objects (resulting from indexing a project),
   * create a zip file of the contents. The original files do not have to live on the local filesystem.
   */
  createZipFromFiles = (files: FileInfo[], dest: string) => {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip');
      const output = fs.createWriteStream(dest);

      archive.pipe(output);
      for (const f in files) {
        const file = files[f];
        archive.append(file.content, { name: file.relativePath });
      }
      archive.finalize();

      output.on('close', () => resolve(archive));
      archive.on('error', err => reject(err));
    });
  };

  /**
   * given a local folder of files, create a zipfile.
   * only works with local files (not those managed by a storage provider)
   * This method is deprecated in favor of createZipFromFiles.
   */
  // archiveDirectory = (src: string, dest: string) => {
  //   return new Promise((resolve, reject) => {
  //     const archive = archiver('zip');
  //     const output = fs.createWriteStream(dest);
  //     archive.pipe(output);
  //     archive.directory(src, false);
  //     archive.finalize();
  //     output.on('close', () => resolve(archive));
  //     archive.on('error', err => reject(err));
  //   });
  // };

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
