// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import keys from 'lodash/keys';

import storage, { ClientStorage } from './storage';

const KEY = 'QnaFileStatus';

interface IQnaFileStatus {
  [fileId: string]: boolean;
}

// add qna publish status to local storage
class QnaFileStatusStorage {
  private storage: ClientStorage;
  private _all: { [projectId: string]: IQnaFileStatus };

  constructor() {
    this.storage = storage;
    this._all = this.storage.get(KEY, {});
  }

  public get(projectId: string) {
    return this._all[projectId] || {};
  }

  public updateFileStatus(projectId: string, fileId: string, value = false) {
    if (!projectId) return;
    if (!this._all[projectId]) {
      this._all[projectId] = {};
    }
    if (this._all[projectId][fileId] !== value) {
      this._all[projectId][fileId] = value;
      this.storage.set(KEY, this._all);
    }
  }

  public removeFileStatus(projectId: string, fileId: string) {
    if (!projectId) return;
    if (typeof this._all[projectId][fileId] !== 'undefined') {
      delete this._all[projectId][fileId];
      this.storage.set(KEY, this._all);
    }
  }

  public checkFileStatus(projectId: string, fileIds: string[]) {
    fileIds.forEach((id) => this.updateFileStatus(projectId, id, false));
  }

  public publishAll(projectId: string) {
    if (!projectId) return;
    keys(this._all[projectId]).forEach((key) => {
      this._all[projectId][key] = true;
    });
    this.storage.set(KEY, this._all);
  }

  public removeAllStatuses(projectId: string) {
    if (this._all[projectId]) {
      delete this._all[projectId];
      this.storage.set(KEY, this._all);
    }
  }
}

export default new QnaFileStatusStorage();
