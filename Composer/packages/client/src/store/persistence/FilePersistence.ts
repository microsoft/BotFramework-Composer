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
import { FileChangeType, FileExtensions, ResourceInfo } from './types';
import FileQueue from './FileQueue';

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
  private _queue = new FileQueue();
  private _lock = false;

  private _operator = {
    [FileChangeType.CREATE]: this.create.bind(this),
    [FileChangeType.UPDATE]: this.update.bind(this),
    [FileChangeType.DELETE]: this.remove.bind(this),
  };

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

  public async remove(file: ResourceInfo) {
    const { name } = file;
    await this._files[name].removeFile();
    this.detach(name);
  }

  public async update(file: ResourceInfo) {
    const { name, content } = file;
    await this._files[name].updateFile(content, this._handleError(name));
  }

  public async create(file: ResourceInfo) {
    const { name, content } = file;
    this.attach(name);
    await this._files[name].createFile(name, content);
  }

  public async operate() {
    try {
      if (this._lock) return;
      this._lock = true;
      while (this._queue.tasks.length) {
        const tasks = this._queue.popList();
        await Promise.all(tasks.map(async task => await this._operator[task.changeType](task.file)));
      }
      this._lock = false;
    } catch (error) {
      this._handleError('')(error);
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
    const files = this._getChangedFiles(type, action.payload?.id, currentState);
    this._queue.push(files, type.changeType);
    await this.operate();
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

  private _createResourceInfo(file: any, fileType: FileExtensions): ResourceInfo {
    let content = file.content;
    if (fileType === FileExtensions.Dialog) {
      content = JSON.stringify(content, null, 2) + '\n';
    }
    return { name: `${file.id}${fileType}`, content };
  }

  private _getChangedFiles({ changeType, fileType }, id: string, state: State): ResourceInfo[] {
    const { dialogs, luFiles, lgFiles } = state;
    const files: ResourceInfo[] = [];

    switch (fileType) {
      case FileExtensions.Dialog: {
        const dialog = dialogs.find(dialog => dialog.id === id);
        if (changeType === FileChangeType.CREATE) {
          luFiles
            .filter(lu => getBaseName(lu.id) === id)
            .forEach(lu => {
              files.push(this._createResourceInfo(lu, FileExtensions.Lu));
            });
          lgFiles
            .filter(lg => getBaseName(lg.id) === id)
            .forEach(lg => {
              files.push(this._createResourceInfo(lg, FileExtensions.Lg));
            });
          files.push(this._createResourceInfo(dialog, fileType));
        } else if (changeType === FileChangeType.DELETE) {
          keys(this._files)
            .filter(fileName => {
              const fileId = getBaseName(fileName);
              return fileId === id || (getBaseName(fileId) === id && fileType === FileExtensions.Dialog);
            })
            .forEach(fileName => files.push({ name: fileName, content: '' }));
        } else {
          files.push(this._createResourceInfo(dialog, fileType));
        }

        break;
      }
      case FileExtensions.Lu: {
        const lu = luFiles.find(lu => lu.id === id);
        files.push(this._createResourceInfo(lu, fileType));
        break;
      }
      case FileExtensions.Lg: {
        const lg = lgFiles.find(lg => lg.id === id);
        files.push(this._createResourceInfo(lg, fileType));
        break;
      }
    }
    return files;
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
