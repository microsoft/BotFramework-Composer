// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';
import { LgFile, LuFile, DialogInfo } from '@bfc/shared';

import { Store, State } from '../types';
import { setError, fetchProject } from '../action';
import { ActionTypes } from '../../constants';
import { ActionType } from '../action/types';
import { getBaseName } from '../../utils';

import * as client from './http';
import { IFileChange } from './types';
import { ChangeType, FileExtensions } from './types';

const fileChangeInfo = {
  [ActionTypes.CREATE_DIALOG]: { changeType: ChangeType.CREATE, fileType: FileExtensions.Dialog },
  [ActionTypes.UPDATE_DIALOG]: { changeType: ChangeType.UPDATE, fileType: FileExtensions.Dialog },
  [ActionTypes.REMOVE_DIALOG]: { changeType: ChangeType.DELETE, fileType: FileExtensions.Dialog },
  [ActionTypes.UPDATE_LG]: { changeType: ChangeType.UPDATE, fileType: FileExtensions.Lg },
  [ActionTypes.CREATE_LG]: { changeType: ChangeType.CREATE, fileType: FileExtensions.Lg },
  [ActionTypes.REMOVE_LG]: { changeType: ChangeType.DELETE, fileType: FileExtensions.Lg },
  [ActionTypes.UPDATE_LU]: { changeType: ChangeType.UPDATE, fileType: FileExtensions.Lu },
  [ActionTypes.CREATE_LU]: { changeType: ChangeType.CREATE, fileType: FileExtensions.Lu },
  [ActionTypes.REMOVE_LU]: { changeType: ChangeType.DELETE, fileType: FileExtensions.Lu },
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

    const changeInfo = fileChangeInfo[action.type];

    if (!changeInfo) return;

    const fileChanges: IFileChange[] = this._getFileChanges(
      changeInfo,
      action.payload?.id,
      previousState,
      currentState
    );

    for (const change of fileChanges) {
      if (this._taskQueue[change.id]) {
        this._taskQueue[change.id].push(change);
      } else {
        this._taskQueue[change.id] = [change];
      }
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
      this._taskQueue = {};
      this._projectId = payload.response.data.id;
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

  private _createResourceInfo(file: any, fileType: FileExtensions, changeType: ChangeType): IFileChange {
    let content = file.content;
    if (fileType === FileExtensions.Dialog) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { id: `${file.id}${fileType}`, change: content, type: changeType };
  }

  private _getFileChangesById(
    id: string,
    changeType: ChangeType,
    dialogs: DialogInfo[],
    luFiles: LuFile[],
    lgFiles: LgFile[]
  ) {
    const files: IFileChange[] = [];
    const dialog = dialogs.find(dialog => dialog.id === id);
    luFiles
      .filter(lu => getBaseName(lu.id) === id)
      .forEach(lu => {
        files.push(this._createResourceInfo(lu, FileExtensions.Lu, changeType));
      });
    lgFiles
      .filter(lg => getBaseName(lg.id) === id)
      .forEach(lg => {
        files.push(this._createResourceInfo(lg, FileExtensions.Lg, changeType));
      });
    files.push(this._createResourceInfo(dialog, FileExtensions.Dialog, changeType));
    return files;
  }

  private _getFileChanges(changeInfo, id: string, previousState: State, currentState: State): IFileChange[] {
    const { dialogs, luFiles, lgFiles } = currentState;
    let files: IFileChange[] = [];
    const { changeType, fileType } = changeInfo;
    switch (fileType) {
      case FileExtensions.Dialog: {
        const dialog = dialogs.find(dialog => dialog.id === id);
        if (changeType === ChangeType.CREATE) {
          files = this._getFileChangesById(id, changeType, dialogs, luFiles, lgFiles);
        } else if (changeType === ChangeType.DELETE) {
          files = this._getFileChangesById(
            id,
            changeType,
            previousState.dialogs,
            previousState.luFiles,
            previousState.lgFiles
          );
        } else {
          files.push(this._createResourceInfo(dialog, fileType, changeType));
        }
        break;
      }
      case FileExtensions.Lu: {
        const lu = luFiles.find(lu => lu.id === id);
        files.push(this._createResourceInfo(lu, fileType, changeType));
        break;
      }
      case FileExtensions.Lg: {
        const lg = lgFiles.find(lg => lg.id === id);
        files.push(this._createResourceInfo(lg, fileType, changeType));
        break;
      }
    }
    return files;
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
