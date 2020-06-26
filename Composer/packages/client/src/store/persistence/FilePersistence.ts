// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';

import { Store, State } from '../types';
import { setError, fetchProject } from '../action';
import { ActionTypes } from '../../constants';
import { ActionType } from '../action/types';
import { getBaseName } from '../../utils';

import * as client from './http';
import { IFileChange, ChangeType, FileExtensions } from './types';

const actionType2ChangeType = {
  [ActionTypes.CREATE_DIALOG]: { changeType: ChangeType.CREATE, fileExtension: FileExtensions.Dialog },
  [ActionTypes.UPDATE_DIALOG]: { changeType: ChangeType.UPDATE, fileExtension: FileExtensions.Dialog },
  [ActionTypes.REMOVE_DIALOG]: { changeType: ChangeType.DELETE, fileExtension: FileExtensions.Dialog },
  [ActionTypes.UPDATE_LG]: { changeType: ChangeType.UPDATE, fileExtension: FileExtensions.Lg },
  [ActionTypes.CREATE_LG]: { changeType: ChangeType.CREATE, fileExtension: FileExtensions.Lg },
  [ActionTypes.REMOVE_LG]: { changeType: ChangeType.DELETE, fileExtension: FileExtensions.Lg },
  [ActionTypes.UPDATE_LU]: { changeType: ChangeType.UPDATE, fileExtension: FileExtensions.Lu },
  [ActionTypes.CREATE_LU]: { changeType: ChangeType.CREATE, fileExtension: FileExtensions.Lu },
  [ActionTypes.REMOVE_LU]: { changeType: ChangeType.DELETE, fileExtension: FileExtensions.Lu },
  [ActionTypes.CREATE_SKILL_MANIFEST]: { changeType: ChangeType.CREATE, fileExtension: FileExtensions.Manifest },
  [ActionTypes.REMOVE_SKILL_MANIFEST]: { changeType: ChangeType.DELETE, fileExtension: FileExtensions.Manifest },
  [ActionTypes.UPDATE_SKILL_MANIFEST]: { changeType: ChangeType.UPDATE, fileExtension: FileExtensions.Manifest },
  [ActionTypes.SYNC_ENV_SETTING]: { changeType: ChangeType.UPDATE, fileExtension: FileExtensions.Setting },
};

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

  public get projectId(): string {
    return this._projectId;
  }

  public get taskQueue() {
    return this._taskQueue;
  }

  public async notify(previousState: State, currentState: State, action: ActionType) {
    if (action.type === ActionTypes.GET_PROJECT_SUCCESS) {
      this.init(action.payload);
      return;
    }

    if (!this._projectId) return;

    const fileChanges: IFileChange[] = this.getFileChanges(previousState, currentState, action);

    for (const change of fileChanges) {
      if (!this._taskQueue[change.id]) {
        this._taskQueue[change.id] = [];
      }
      this._taskQueue[change.id].push(change);
    }

    await this.flush();
  }

  public registerHandleError(store: Store) {
    const curStore = store;
    this._handleError = (name) => (err) => {
      //TODO: error handling now if sync file error, do a full refresh.
      const fileName = name;
      setError(curStore, {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: `HANDLE ${fileName} ERROR`,
      });
      fetchProject(curStore);
    };
  }

  private init(payload) {
    if (payload) {
      if (this._projectId !== payload.response.data.id) {
        this._projectId = payload.response.data.id;
      }
    }
  }

  public async flush(): Promise<boolean> {
    try {
      if (this._isFlushing) {
        return new Promise((resolve) => {
          const timer = setInterval(() => {
            if (this.isEmpty()) {
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

  private createChange(
    file: any,
    fileExtension: FileExtensions,
    changeType: ChangeType,
    projectId: string
  ): IFileChange {
    let content = file.content;
    const isJson = [FileExtensions.Dialog, FileExtensions.Manifest, FileExtensions.Setting].includes(fileExtension);
    if (isJson) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { id: `${file.id}${fileExtension}`, change: content, type: changeType, projectId };
  }

  private getDialogFileChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
    const projectId = currentState.projectId;
    const fileChanges: IFileChange[] = [];
    let { dialogs, luFiles, lgFiles } = currentState;

    //if delete dialog the change need to get changes from previousState
    if (changeType === ChangeType.DELETE) {
      dialogs = previousState.dialogs;
      luFiles = previousState.luFiles;
      lgFiles = previousState.lgFiles;
    }

    //create and delete need to delete/create lu and lg files
    if (changeType !== ChangeType.UPDATE) {
      luFiles
        .filter((lu) => getBaseName(lu.id) === id)
        .forEach((lu) => {
          fileChanges.push(this.createChange(lu, FileExtensions.Lu, changeType, projectId));
        });
      lgFiles
        .filter((lg) => getBaseName(lg.id) === id)
        .forEach((lg) => {
          fileChanges.push(this.createChange(lg, FileExtensions.Lg, changeType, projectId));
        });
    }
    const dialog = dialogs.find((dialog) => dialog.id === id);
    fileChanges.push(this.createChange(dialog, FileExtensions.Dialog, changeType, projectId));
    return fileChanges;
  }

  private getLuFileChanges(
    id: string,
    previousState: State,
    currentState: State,
    changeType: ChangeType,
    projectId: string
  ) {
    const fileChanges: IFileChange[] = [];
    const { luFiles } = currentState;

    const lu = luFiles.find((lu) => lu.id === id);
    fileChanges.push(this.createChange(lu, FileExtensions.Lu, changeType, projectId));
    return fileChanges;
  }

  private getLgFileChanges(
    id: string,
    previousState: State,
    currentState: State,
    changeType: ChangeType,
    projectId: string
  ) {
    const fileChanges: IFileChange[] = [];
    const { lgFiles } = currentState;

    const lg = lgFiles.find((lg) => lg.id === id);
    fileChanges.push(this.createChange(lg, FileExtensions.Lg, changeType, projectId));
    return fileChanges;
  }

  private getSkillManifestsChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
    const projectId = currentState.projectId;
    const fileChanges: IFileChange[] = [];
    let { skillManifests } = currentState;

    if (changeType === ChangeType.DELETE) {
      skillManifests = previousState.skillManifests;
    }
    const skillManifest = skillManifests.find((skill) => skill.id === id);
    fileChanges.push(this.createChange(skillManifest, FileExtensions.Manifest, changeType, projectId));
    return fileChanges;
  }

  private getSettingsChanges(previousState: State, currentState: State, projectId: string) {
    return [
      {
        id: `${FileExtensions.Setting}`,
        change: JSON.stringify(currentState.settings, null, 2),
        type: ChangeType.UPDATE,
        projectId,
      },
    ];
  }

  private getFileChanges(previousState: State, currentState: State, action: ActionType): IFileChange[] {
    let fileChanges: IFileChange[] = [];
    const fileChangeType = actionType2ChangeType[action.type];

    if (!fileChangeType) return fileChanges;

    const { changeType, fileExtension } = fileChangeType;
    const targetId = action.payload.id;

    switch (fileExtension) {
      case FileExtensions.Dialog: {
        fileChanges = this.getDialogFileChanges(targetId, previousState, currentState, changeType);
        break;
      }
      case FileExtensions.Lu: {
        fileChanges = this.getLuFileChanges(
          targetId,
          previousState,
          currentState,
          changeType,
          action.payload.projectId
        );
        break;
      }
      case FileExtensions.Lg: {
        fileChanges = this.getLgFileChanges(
          targetId,
          previousState,
          currentState,
          changeType,
          action.payload.projectId
        );
        break;
      }
      case FileExtensions.Manifest: {
        fileChanges = this.getSkillManifestsChanges(targetId, previousState, currentState, changeType);
        break;
      }
      case FileExtensions.Setting: {
        fileChanges = this.getSettingsChanges(previousState, currentState, action.payload.projectId);
      }
    }
    return fileChanges;
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
