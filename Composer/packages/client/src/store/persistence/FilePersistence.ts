// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import keys from 'lodash/keys';

import { setError, fetchProject } from '../action';

import { Store } from './../types';
import { FileExtensions, FileChangeType } from './types';
import { FileOperation } from './FileOperation';

class FilePersistence {
  private _files: { [fileName: string]: FileOperation };
  private _projectId = '';
  private _handleError = name => error => {};

  constructor() {
    this._files = {};
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

  public async notify(changeType: FileChangeType, id: string, fileType: FileExtensions, content: any) {
    if (!this.projectId) return;
    const name = `${id}${fileType}`;

    if (fileType === FileExtensions.Dialog) {
      content = JSON.stringify(content, null, 2) + '\n';
    }

    if (changeType === FileChangeType.CREATE) {
      this.attach(name);
      this._files;
    }

    try {
      await this._files[name].operation({ changeType, name, content }, this._handleError(name));
    } catch (err) {
      this._handleError(name)(err);
    }

    if (changeType === FileChangeType.DELETE) {
      this.detach(name);
    }
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
