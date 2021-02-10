// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import isEqual from 'lodash/isEqual';
import { DialogSetting, BotAssets, BotProjectFile, CrosstrainConfig } from '@bfc/shared';
import keys from 'lodash/keys';
import formatMessage from 'format-message';

import fileDiffCalculator from '../parsers/fileDiffCalculator';

import * as client from './http';
import { ChangeType, FileDifference, FileExtensions, IFileChange, FileAsset } from './types';

class FilePersistence {
  private _taskQueue: { [id: string]: IFileChange[] } = {};
  private _projectId = '';
  private _handleError?: (err) => void;
  private _isFlushing = false;

  private _operator = {
    [ChangeType.CREATE]: this.create,
    [ChangeType.UPDATE]: this.update,
    [ChangeType.DELETE]: this.delete,
  };

  constructor(projectId: string) {
    this._projectId = projectId;
  }

  public get projectId(): string {
    return this._projectId;
  }

  public get taskQueue() {
    return this._taskQueue;
  }

  public async notify(currentAssets: BotAssets, previousAssets: BotAssets) {
    const fileChanges: IFileChange[] = await this.getAssetsChanges(currentAssets, previousAssets);

    this.createTaskQueue(fileChanges);

    await this.flush();
  }

  public createTaskQueue(fileChanges: IFileChange[]) {
    for (const change of fileChanges) {
      if (!this._taskQueue[change.id]) {
        this._taskQueue[change.id] = [];
      }
      this._taskQueue[change.id].push(change);
    }
  }

  public async flush(): Promise<boolean> {
    try {
      if (this._isFlushing) {
        return new Promise((resolve) => {
          const timer = setInterval(() => {
            if (this.isEmpty() && !this._isFlushing) {
              clearInterval(timer);
              resolve(true);
            }
          }, 100);
        });
      }

      this._isFlushing = true;
      while (!this.isEmpty()) {
        const tasks: Promise<void>[] = [];
        keys(this._taskQueue).forEach((key) => {
          const fileChange = this.mergeChanges(this._taskQueue[key]);
          this._taskQueue[key] = [];
          if (fileChange) tasks.push(this._operator[fileChange.type](fileChange));
        });
        await Promise.all(tasks);
      }
      return Promise.resolve(true);
    } catch (error) {
      if (this._handleError && error) {
        const payload = new Error(error?.response?.data?.message ?? error?.message ?? JSON.stringify(error));
        payload.name = formatMessage('Fail to save bot');
        this._handleError(payload);
      }
      return Promise.resolve(false);
    } finally {
      this._isFlushing = false;
    }
  }

  private async delete(fileChange: IFileChange) {
    const { id, projectId } = fileChange;
    await client.deleteFile(projectId, id);
  }

  private async update(fileChange: IFileChange) {
    const { id, change, projectId } = fileChange;
    await client.updateFile(projectId, id, change);
  }

  private async create(fileChange: IFileChange) {
    const { id, change, projectId } = fileChange;
    await client.createFile(projectId, id, change);
  }

  private isEmpty() {
    return keys(this._taskQueue).every((key) => !this._taskQueue[key].length);
  }

  private mergeChanges(changes: IFileChange[]) {
    if (!changes.length) return null;
    if (changes.length === 1) return changes[0];
    const lastIndex = changes.length - 1;
    if (changes[0].type === ChangeType.CREATE) {
      return { ...changes[lastIndex], type: ChangeType.CREATE };
    }
    return changes[lastIndex];
  }

  private createChange(file: any, fileExtension: FileExtensions, changeType: ChangeType): IFileChange {
    let content = file.content;
    const isJson = [
      FileExtensions.Dialog,
      FileExtensions.DialogSchema,
      FileExtensions.Manifest,
      FileExtensions.Setting,
      FileExtensions.Recognizer,
      FileExtensions.CrossTrainConfig,
    ].includes(fileExtension);
    if (isJson) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { id: `${file.id}${fileExtension}`, change: content, type: changeType, projectId: this._projectId };
  }

  private async getFilesChanges(current: FileAsset[], previous: FileAsset[], fileExtension: FileExtensions) {
    const changes = (await fileDiffCalculator.difference(current, previous)) as FileDifference;
    const updated = changes.updated.map((file) => this.createChange(file, fileExtension, ChangeType.UPDATE));
    const added = changes.added.map((file) => this.createChange(file, fileExtension, ChangeType.CREATE));
    const deleted = changes.deleted.map((file) => this.createChange(file, fileExtension, ChangeType.DELETE));
    const fileChanges: IFileChange[] = [...updated, ...added, ...deleted];
    return fileChanges;
  }

  private getCrossTrainConfigChanges(current: CrosstrainConfig, previous: CrosstrainConfig) {
    if (isEqual(current, previous)) return [];
    let changeType = ChangeType.UPDATE;
    if (!keys(previous).length) {
      changeType = ChangeType.CREATE;
    }
    if (!keys(current).length) {
      changeType = ChangeType.DELETE;
    }
    return [this.createChange({ id: '', content: current }, FileExtensions.CrossTrainConfig, changeType)];
  }

  private getBotProjectFileChanges(current: BotProjectFile, previous: BotProjectFile) {
    if (!isEqual(current, previous)) {
      return [
        {
          id: `${current.id}${FileExtensions.BotProject}`,
          change: JSON.stringify(current.content, null, 2),
          type: ChangeType.UPDATE,
          projectId: this._projectId,
        },
      ];
    }
    return [];
  }

  private getSettingsChanges(current: DialogSetting, previous: DialogSetting) {
    if (!isEqual(current, previous)) {
      return [
        {
          id: `${FileExtensions.Setting}`,
          change: JSON.stringify(current, null, 2),
          type: ChangeType.UPDATE,
          projectId: this._projectId,
        },
      ];
    }
    return [];
  }

  public async getAssetsChanges(currentAssets: BotAssets, previousAssets: BotAssets): Promise<IFileChange[]> {
    const files: [FileAsset[], FileAsset[], FileExtensions][] = [
      [currentAssets.dialogs, previousAssets.dialogs, FileExtensions.Dialog],
      [currentAssets.dialogSchemas, previousAssets.dialogSchemas, FileExtensions.DialogSchema],
      [currentAssets.luFiles, previousAssets.luFiles, FileExtensions.Lu],
      [currentAssets.qnaFiles, previousAssets.qnaFiles, FileExtensions.QnA],
      [currentAssets.lgFiles, previousAssets.lgFiles, FileExtensions.Lg],
      [currentAssets.skillManifests, previousAssets.skillManifests, FileExtensions.Manifest],
      [currentAssets.formDialogSchemas, previousAssets.formDialogSchemas, FileExtensions.FormDialogSchema],
      [currentAssets.recognizers, previousAssets.recognizers, FileExtensions.Recognizer],
    ];

    const changes = await Promise.all(
      files.map(async (item) => {
        return await this.getFilesChanges(item[0], item[1], item[2]);
      })
    );

    const settingChanges = this.getSettingsChanges(currentAssets.setting, previousAssets.setting);

    const botProjectFileChanges = this.getBotProjectFileChanges(
      currentAssets.botProjectFile,
      previousAssets.botProjectFile
    );

    const crossTrainFileChanges = this.getCrossTrainConfigChanges(
      currentAssets.crossTrainConfig,
      previousAssets.crossTrainConfig
    );

    const fileChanges: IFileChange[] = [...settingChanges, ...botProjectFileChanges, ...crossTrainFileChanges];
    changes.forEach((item) => fileChanges.push(...item));
    return fileChanges;
  }

  public registerErrorHandler(fun: (error) => void) {
    this._handleError = fun;
  }

  public isErrorHandlerEmpty() {
    return !this._handleError;
  }
}

export default FilePersistence;
