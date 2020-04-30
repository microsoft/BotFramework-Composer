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
  [ActionTypes.CREATE_SKILL_MANIFEST]: { changeType: ChangeType.CREATE, fileType: FileExtensions.Manifest },
  [ActionTypes.REMOVE_SKILL_MANIFEST]: { changeType: ChangeType.DELETE, fileType: FileExtensions.Manifest },
  [ActionTypes.UPDATE_SKILL_MANIFEST]: { changeType: ChangeType.UPDATE, fileType: FileExtensions.Manifest },
};

class FilePersistence {
  private _taskQueue: { [id: string]: IFileChange[] } = {};
  private _projectId = '';
  private _handleError = name => error => {};
  private _isFlushing = false;

  private _operator = {
    [ChangeType.CREATE]: this._create,
    [ChangeType.UPDATE]: this._update,
    [ChangeType.DELETE]: this._delete,
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

    const fileChanges: IFileChange[] = this._getFileChanges(previousState, currentState, action);

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
    this._handleError = name => err => {
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
        this._taskQueue = {};
        this._projectId = payload.response.data.id;
      }
    }
  }

  public async flush() {
    try {
      if (this._isFlushing) return;
      this._isFlushing = true;
      while (!this._isEmpty()) {
        const tasks: Promise<void>[] = [];
        keys(this._taskQueue).forEach(key => {
          const fileChange = this._mergeChanges(this._taskQueue[key]);
          this._taskQueue[key] = [];
          if (fileChange) tasks.push(this._operator[fileChange.type](fileChange, this._projectId));
        });
        await Promise.all(tasks);
      }
      this._isFlushing = false;
    } catch (error) {
      this._handleError('')(error);
    }
  }

  private async _delete(fileChange: IFileChange, projectId: string) {
    const { id } = fileChange;
    await client.deleteFile(projectId, id);
  }

  private async _update(fileChange: IFileChange, projectId: string) {
    const { id, change } = fileChange;
    await client.updateFile(projectId, id, change);
  }

  private async _create(fileChange: IFileChange, projectId: string) {
    const { id, change } = fileChange;
    await client.createFile(projectId, id, change);
  }

  private _isEmpty() {
    return keys(this._taskQueue).every(key => !this._taskQueue[key].length);
  }

  private _mergeChanges(changes: IFileChange[]) {
    if (!changes.length) return null;
    if (changes.length === 1) return changes[0];
    const lastIndex = changes.length - 1;
    if (changes[0].type === ChangeType.CREATE) {
      return { ...changes[lastIndex], type: ChangeType.CREATE };
    }
    return changes[lastIndex];
  }

  private _createChange(file: any, fileExtension: FileExtensions, changeType: ChangeType): IFileChange {
    let content = file.content;
    if (fileExtension === FileExtensions.Dialog || fileExtension === FileExtensions.Manifest) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { id: `${file.id}${fileExtension}`, change: content, type: changeType };
  }

  private _getDialogFileChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
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
        .filter(lu => getBaseName(lu.id) === id)
        .forEach(lu => {
          fileChanges.push(this._createChange(lu, FileExtensions.Lu, changeType));
        });
      lgFiles
        .filter(lg => getBaseName(lg.id) === id)
        .forEach(lg => {
          fileChanges.push(this._createChange(lg, FileExtensions.Lg, changeType));
        });
    }
    const dialog = dialogs.find(dialog => dialog.id === id);
    fileChanges.push(this._createChange(dialog, FileExtensions.Dialog, changeType));
    return fileChanges;
  }

  private _getLuFileChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
    const fileChanges: IFileChange[] = [];
    const { luFiles } = currentState;

    const lu = luFiles.find(lu => lu.id === id);
    fileChanges.push(this._createChange(lu, FileExtensions.Lu, changeType));
    return fileChanges;
  }

  private _getLgFileChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
    const fileChanges: IFileChange[] = [];
    const { lgFiles } = currentState;

    const lg = lgFiles.find(lg => lg.id === id);
    fileChanges.push(this._createChange(lg, FileExtensions.Lg, changeType));
    return fileChanges;
  }

  private _getSkillManifestsChanges(id: string, previousState: State, currentState: State, changeType: ChangeType) {
    const fileChanges: IFileChange[] = [];
    let { skillManifests } = currentState;

    if (changeType === ChangeType.DELETE) {
      skillManifests = previousState.skillManifests;
    }
    const skillManifest = skillManifests.find(skill => skill.id === id);
    fileChanges.push(this._createChange(skillManifest, FileExtensions.Manifest, changeType));
    return fileChanges;
  }

  private _getFileChanges(previousState: State, currentState: State, action: ActionType): IFileChange[] {
    let fileChanges: IFileChange[] = [];
    const fileChangeType = actionType2ChangeType[action.type];

    if (!fileChangeType) return fileChanges;

    const { changeType, fileExtension } = fileChangeType;
    const targetId = action.payload.id;

    switch (fileExtension) {
      case FileExtensions.Dialog: {
        fileChanges = this._getDialogFileChanges(targetId, previousState, currentState, changeType);
        break;
      }
      case FileExtensions.Lu: {
        fileChanges = this._getLuFileChanges(targetId, previousState, currentState, changeType);
        break;
      }
      case FileExtensions.Lg: {
        fileChanges = this._getLgFileChanges(targetId, previousState, currentState, changeType);
        break;
      }
      case FileExtensions.Manifest: {
        fileChanges = this._getSkillManifestsChanges(targetId, previousState, currentState, changeType);
        break;
      }
    }
    return fileChanges;
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
