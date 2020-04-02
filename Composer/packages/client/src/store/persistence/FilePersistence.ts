// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import keys from 'lodash/keys';

import { Store, State } from '../types';
import { setError, fetchProject } from '../action';
import { ActionTypes } from '../../constants';
import { ActionType } from '../action/types';
import { getBaseName } from '../../utils';

import { FileOperation } from './FileOperation';
import { FileChangeType, FileExtensions } from './types';

const fileChangeType = {
  [ActionTypes.CREATE_DIALOG]: { changeType: FileChangeType.CREATE, fileType: FileExtensions.Dialog },
  [ActionTypes.UPDATE_DIALOG]: { changeType: FileChangeType.UPDATE, fileType: FileExtensions.Dialog },
  [ActionTypes.REMOVE_DIALOG]: { changeType: FileChangeType.DELETE, fileType: FileExtensions.Dialog },
  [ActionTypes.UPDATE_LG]: { changeType: FileChangeType.UPDATE, fileType: FileExtensions.Lg },
  [ActionTypes.CREATE_LG]: { changeType: FileChangeType.CREATE, fileType: FileExtensions.Lg },
  [ActionTypes.REMOVE_LG]: { changeType: FileChangeType.DELETE, fileType: FileExtensions.Lg },
  [ActionTypes.UPDATE_LU]: { changeType: FileChangeType.UPDATE, fileType: FileExtensions.Lu },
  [ActionTypes.CREATE_LU]: { changeType: FileChangeType.CREATE, fileType: FileExtensions.Lu },
  [ActionTypes.REMOVE_LU]: { changeType: FileChangeType.DELETE, fileType: FileExtensions.Lu },
};

class FilePersistence {
  private _files: { [fileName: string]: FileOperation };
  private _projectId = '';
  private _handleError = name => error => {};

  constructor() {
    this._files = {};
  }

  public init(payload) {
    if (payload) {
      this.clear();
      const { files, id } = payload.response.data;
      this._projectId = id;
      files.forEach(file => {
        this.attach(file.name, file);
      });
    }
  }

  public set projectId(v: string) {
    this._projectId = v;
  }

  public get projectId(): string {
    return this._projectId;
  }

  public get files(): { [fileName: string]: FileOperation } {
    return this._files;
  }

  public clear() {
    keys(this._files).forEach(key => {
      this._files[key].flush();
    });
    this._files = {};
  }

  public attach(name: string, file?: FileInfo) {
    this._files[name] = new FileOperation(this._projectId, file);
  }

  public detach(fileName: string) {
    if (this._files[fileName]) delete this._files[fileName];
  }

  public async doRemove(fileName: string) {
    try {
      await this._files[fileName].removeFile();
      this.detach(fileName);
    } catch (error) {
      this._handleError(fileName)(error);
    }
  }

  public async doUpdate(fileName: string, content: string) {
    try {
      if (!this._files[fileName]) {
        this.attach(fileName);
        await this._files[fileName].createFile(fileName, content);
      } else {
        await this._files[fileName].updateFile(content, this._handleError(fileName));
      }
    } catch (error) {
      this._handleError(fileName)(error);
    }
  }

  public async operate({ changeType, fileType }, id: string, state: State) {
    if (changeType === FileChangeType.DELETE) {
      keys(this._files).forEach(fileName => {
        const fileId = getBaseName(fileName);
        if (fileId === id || (getBaseName(fileId) === id && fileType === FileExtensions.Dialog)) {
          this.doRemove(fileName);
        }
      });
    } else {
      const { dialogs, luFiles, lgFiles } = state;
      dialogs
        .filter(d => d.id === id)
        .forEach(d => {
          this.doUpdate(`${id}.dialog`, JSON.stringify(d.content, null, 2) + '\n');
        });
      luFiles
        .filter(
          lu =>
            (getBaseName(lu.id) === id && changeType === FileChangeType.CREATE && fileType === FileExtensions.Dialog) ||
            lu.id === id
        )
        .forEach(lu => {
          this.doUpdate(`${lu.id}.lu`, lu.content);
        });
      lgFiles
        .filter(
          lg =>
            (getBaseName(lg.id) === id && changeType === FileChangeType.CREATE && fileType === FileExtensions.Dialog) ||
            lg.id === id
        )
        .forEach(lg => {
          this.doUpdate(`${lg.id}.lg`, lg.content);
        });
    }
  }

  public async notify(previousState: State, currentState: State, action: ActionType) {
    if (action.type === ActionTypes.GET_PROJECT_SUCCESS) {
      this.init(action.payload);
      return;
    }
    if (!this.projectId) return;
    const type = fileChangeType[action.type];
    if (!type) return;
    await this.operate({ ...type }, action.payload?.id, currentState);
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
}

const filePersistence = new FilePersistence();

export default filePersistence;
