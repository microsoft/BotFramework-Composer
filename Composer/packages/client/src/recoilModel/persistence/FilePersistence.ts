// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
  BotAssets,
  BotProjectFile,
  DialogInfo,
  DialogSchemaFile,
  DialogSetting,
  FormDialogSchema,
  SkillManifest,
} from '@bfc/shared';
import { LgFile, LuFile, QnAFile } from '@bfc/types';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';

import * as client from './http';
import { ChangeType, FileExtensions, IFileChange } from './types';

class FilePersistence {
  private _taskQueue: { [id: string]: IFileChange[] } = {};
  private _projectId = '';
  private _handleError = (name) => (error) => {};
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
    const fileChanges: IFileChange[] = this.getAssetsChanges(currentAssets, previousAssets);

    for (const change of fileChanges) {
      if (!this._taskQueue[change.id]) {
        this._taskQueue[change.id] = [];
      }
      this._taskQueue[change.id].push(change);
    }

    await this.flush();
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
      this._handleError('')(error);
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
    ].includes(fileExtension);
    if (isJson) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { id: `${file.id}${fileExtension}`, change: content, type: changeType, projectId: this._projectId };
  }

  private getDifferenceItems(current: any[], previous: any[]) {
    const changes1 = differenceWith(current, previous, isEqual);
    const changes2 = differenceWith(previous, current, isEqual);
    const deleted = changes2.filter((change) => !current.some((file) => change.id === file.id));
    const { updated, added } = changes1.reduce(
      (result: { updated: any[]; added: any[] }, change) => {
        if (previous.some((file) => change.id === file.id)) {
          result.updated.push(change);
        } else {
          result.added.push(change);
        }

        return result;
      },
      { updated: [], added: [] }
    );

    return { updated, added, deleted };
  }

  private getFileChanges(fileExtension: FileExtensions, changes: { updated: any[]; added: any[]; deleted: any[] }) {
    const updated = changes.updated.map((file) => this.createChange(file, fileExtension, ChangeType.UPDATE));
    const added = changes.added.map((file) => this.createChange(file, fileExtension, ChangeType.CREATE));
    const deleted = changes.deleted.map((file) => this.createChange(file, fileExtension, ChangeType.DELETE));
    const fileChanges: IFileChange[] = [...updated, ...added, ...deleted];
    return fileChanges;
  }

  private getDialogChanges(current: DialogInfo[], previous: DialogInfo[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.Dialog, changeItems);
    return changes;
  }

  private getDialogSchemaChanges(current: DialogSchemaFile[], previous: DialogSchemaFile[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    return this.getFileChanges(FileExtensions.DialogSchema, changeItems);
  }

  private getLuChanges(current: LuFile[], previous: LuFile[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.Lu, changeItems);
    return changes;
  }

  private getQnAChanges(current: QnAFile[], previous: QnAFile[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.QnA, changeItems);
    return changes;
  }

  private getLgChanges(current: LgFile[], previous: LgFile[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.Lg, changeItems);
    return changes;
  }

  private getSkillManifestsChanges(current: SkillManifest[], previous: SkillManifest[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.Manifest, changeItems);
    return changes;
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

  private getFormDialogSchemaFileChanges(current: FormDialogSchema[], previous: FormDialogSchema[]) {
    const changeItems = this.getDifferenceItems(current, previous);
    const changes = this.getFileChanges(FileExtensions.FormDialog, changeItems);
    return changes;
  }

  private getAssetsChanges(currentAssets: BotAssets, previousAssets: BotAssets): IFileChange[] {
    const dialogChanges = this.getDialogChanges(currentAssets.dialogs, previousAssets.dialogs);
    const dialogSchemaChanges = this.getDialogSchemaChanges(currentAssets.dialogSchemas, previousAssets.dialogSchemas);
    const luChanges = this.getLuChanges(currentAssets.luFiles, previousAssets.luFiles);
    const qnaChanges = this.getQnAChanges(currentAssets.qnaFiles, previousAssets.qnaFiles);
    const lgChanges = this.getLgChanges(currentAssets.lgFiles, previousAssets.lgFiles);
    const skillManifestChanges = this.getSkillManifestsChanges(
      currentAssets.skillManifests,
      previousAssets.skillManifests
    );
    const settingChanges = this.getSettingsChanges(currentAssets.setting, previousAssets.setting);

    const formDialogChanges = this.getFormDialogSchemaFileChanges(
      currentAssets.formDialogSchemas,
      previousAssets.formDialogSchemas
    );

    const botProjectFileChanges = this.getBotProjectFileChanges(
      currentAssets.botProjectFile,
      previousAssets.botProjectFile
    );

    const fileChanges: IFileChange[] = [
      ...dialogChanges,
      ...dialogSchemaChanges,
      ...luChanges,
      ...qnaChanges,
      ...lgChanges,
      ...skillManifestChanges,
      ...settingChanges,
      ...formDialogChanges,
      ...botProjectFileChanges,
    ];
    return fileChanges;
  }
}

export default FilePersistence;
