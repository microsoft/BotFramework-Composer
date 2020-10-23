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
      emptyFiles: { [fileName: string]: boolean };
    }
  ) {
    await this.createRecognizersDir();

    await this.updateCrossTrainConfig(options.luFiles, options.crossTrainConfig);

    await this.updateRecognizers(recognizerTypes, [...options.luFiles, ...options.qnaFiles], options.emptyFiles);
  }

  async createRecognizersDir() {
    if (!(await this.storage.exists(this.folderPath))) {
      await this.storage.mkDir(this.folderPath);
    }
  }

  async updateCrossTrainConfig(luFiles: FileInfo[], crossTrainConfig?: CrossTrainConfig) {
    if (crossTrainConfig && luFiles.length) {
      await this.storage.writeFile(
        `${this.folderPath}/cross-train.config.json`,
        JSON.stringify(crossTrainConfig, null, 2)
      );
    }
  }

  /**
   * update the recoginzers before build
   */
  async updateRecognizers(recognizerTypes: RecognizerTypes, files: FileInfo[], emptyFiles) {
    await Promise.all(
      keys(recognizerTypes).map(async (item) => {
        const type = recognizerTypes[item];
        const targetFiles = files
          .filter((file) => file.name.startsWith(item) && !emptyFiles[file.name])
          .map((item) => item.name);

        const updateFunc = recognizers[type] ?? recognizers.Default;
        await updateFunc(item, targetFiles, this.storage, {
          defalutLanguage: 'en-us',
          folderPath: this.folderPath,
        });
      })
    );
  }
}
