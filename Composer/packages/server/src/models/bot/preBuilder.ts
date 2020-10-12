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

    this.updateCrossTrainConfig(options.luFiles, options.crossTrainConfig);

    this.updateRecognizers(recognizerTypes, [...options.luFiles, ...options.qnaFiles]);
  }

  async createRecognizersDir() {
    if (!(await this.storage.exists(this.folderPath))) {
      await this.storage.mkDir(this.folderPath);
    }
  }

  async updateCrossTrainConfig(luFiles: FileInfo[], crossTrainConfig?: CrossTrainConfig) {
    if (crossTrainConfig) {
      const configWithPath = this.generateCrossTrainConfig(crossTrainConfig, luFiles);
      await this.storage.writeFile(`${this.folderPath}/crossTrain.json`, JSON.stringify(configWithPath, null, 2));
    }
  }

  replaceCrossTrainId(id: string, files: FileInfo[]) {
    if (!id) return id;
    const luFile = files.find((item) => item.name === id);
    return Path.relative(this.folderPath, luFile?.path ?? '');
  }

  generateCrossTrainConfig(crossTrainConfig: CrossTrainConfig, files: FileInfo[]) {
    const pathCache = {};

    const configWithPath = keys(crossTrainConfig).reduce((result: CrossTrainConfig, key: string) => {
      const { triggers: preTriggers, rootDialog } = crossTrainConfig[key];

      if (!pathCache[key]) pathCache[key] = this.replaceCrossTrainId(key, files);

      const triggers = keys(preTriggers).reduce((result: { [key: string]: string[] }, key) => {
        const ids = preTriggers[key];
        result[key] = ids.map((item) => {
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

  updateRecognizers(recognizerTypes: RecognizerTypes, files: FileInfo[]) {
    keys(recognizerTypes).forEach((item) => {
      const type = recognizerTypes[item];
      const targetFiles = files.filter((file) => file.name.startsWith(item)).map((item) => item.name);
      recognizers[type](item, targetFiles, this.storage, { defalutLanguage: 'en-us', folderPath: this.folderPath });
    });
  }
}
