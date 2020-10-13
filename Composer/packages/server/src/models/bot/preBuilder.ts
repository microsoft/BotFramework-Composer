// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import keys from 'lodash/keys';

import { IFileStorage } from '../storage/interface';

import { Path } from './../../utility/path';
import { CrossTrainConfig } from './builder';
import recognizers, { RecognizerTypes } from './recognizer';

const RECOGNIZERS = 'recognizers';

export class PreBuilder {
  folderPath: string;
  storage: IFileStorage;

  constructor(botDir: string, storage: IFileStorage) {
    this.folderPath = Path.join(botDir, RECOGNIZERS);
    this.storage = storage;
  }

  public async prebuild(
    recognizerTypes: RecognizerTypes,
    options: {
      crossTrainConfig?: CrossTrainConfig;
      luFiles: FileInfo[];
      qnaFiles: FileInfo[];
    }
  ) {
    await this.createRecognizersDir();

    await this.updateCrossTrainConfig(options.luFiles, options.crossTrainConfig);

    await this.updateRecognizers(recognizerTypes, [...options.luFiles, ...options.qnaFiles]);
  }

  async createRecognizersDir() {
    if (!(await this.storage.exists(this.folderPath))) {
      await this.storage.mkDir(this.folderPath);
    }
  }

  async updateCrossTrainConfig(luFiles: FileInfo[], crossTrainConfig?: CrossTrainConfig) {
    if (crossTrainConfig && luFiles.length) {
      const configWithPath = this.generateCrossTrainConfig(crossTrainConfig, luFiles);
      await this.storage.writeFile(`${this.folderPath}/crossTrain.json`, JSON.stringify(configWithPath, null, 2));
    }
  }

  replaceCrossTrainId(id: string, files: FileInfo[]) {
    if (!id) return id;
    const luFile = files.find((item) => item.name === id);
    return Path.relative(this.folderPath, luFile?.path ?? '');
  }

  /**
   * convert the cross train config from id to relativePath. The cli use the config to find the files.
   * config = {
   * 'main.lu': {
   *  rootDialog: true,
   *    triggers: {
   *      'intentA':'diaA.lu',
   *       'intentB': 'diaB.lu'
   *    }
   *  }
   * }
   */
  generateCrossTrainConfig(crossTrainConfig: CrossTrainConfig, files: FileInfo[]) {
    const pathCache = {};

    const configWithPath = keys(crossTrainConfig).reduce((result: CrossTrainConfig, key: string) => {
      const { triggers: preTriggers, rootDialog } = crossTrainConfig[key];
      // replace the key with path
      if (!pathCache[key]) pathCache[key] = this.replaceCrossTrainId(key, files);

      const triggers = keys(preTriggers).reduce((result: { [key: string]: string[] }, key) => {
        const ids = preTriggers[key];
        result[key] = ids.map((item) => {
          // replace the trigger value with path
          if (!pathCache[item]) pathCache[item] = this.replaceCrossTrainId(item, files);

          return pathCache[item];
        });
        return result;
      }, {});

      result[pathCache[key]] = { triggers, rootDialog };
      return result;
    }, {});

    return configWithPath;
  }

  /**
   * update the recoginzers before build
   */
  async updateRecognizers(recognizerTypes: RecognizerTypes, files: FileInfo[]) {
    await Promise.all(
      keys(recognizerTypes).map(async (item) => {
        const type = recognizerTypes[item];
        const targetFiles = files.filter((file) => file.name.startsWith(item)).map((item) => item.name);
        await recognizers[type](item, targetFiles, this.storage, {
          defalutLanguage: 'en-us',
          folderPath: this.folderPath,
        });
      })
    );
  }
}
