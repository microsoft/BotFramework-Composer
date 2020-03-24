// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/indexers';

import { FileChangeType } from './types';
import { FileOperation } from './FileOperation';

class FilePersistence {
  private files: { [fileName: string]: FileOperation };

  constructor() {
    this.files = {};
  }

  public clear() {
    this.files = {};
  }

  public attach(name: string, projectId: string, file?: FileInfo) {
    this.files[name] = new FileOperation(projectId, file);
  }

  public detach(fileName: string) {
    delete this.files[fileName];
  }

  public notify(payload: any, projectId: string) {
    const { changeType, name } = payload;

    if (changeType === FileChangeType.CREATE) {
      this.attach(name, projectId);
    }

    this.files[name].operation(payload);

    if (changeType === FileChangeType.DELETE) {
      this.detach(name);
    }
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
