// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import keys from 'lodash/keys';

import { FileExtensions } from './types';
import { FileChangeType } from './types';
import { FileOperation } from './FileOperation';

class FilePersistence {
  private files: { [fileName: string]: FileOperation };
  private _projectId = '';
  constructor() {
    this.files = {};
  }

  public set projectId(v: string) {
    this._projectId = v;
  }

  public get projectId(): string {
    return this._projectId;
  }

  public clear() {
    keys(this.files).forEach(key => {
      this.files[key].flush();
    });
    this.files = {};
  }

  public attach(name: string, projectId: string, file?: FileInfo) {
    this.files[name] = new FileOperation(projectId, file);
  }

  public detach(fileName: string) {
    delete this.files[fileName];
  }

  public async notify(changeType: FileChangeType, id: string, fileType: FileExtensions, content: string) {
    const name = `${id}${fileType}`;

    if (fileType === FileExtensions.Dialog) {
      content = JSON.stringify(content, null, 2) + '\n';
    }

    if (changeType === FileChangeType.CREATE) {
      this.attach(name, this.projectId);
      this.files;
    }

    try {
      await this.files[name].operation({ changeType, name, content }, this.handleError(name));
    } catch (err) {
      this.handleError(name)(err);
    }

    if (changeType === FileChangeType.DELETE) {
      this.detach(name);
    }
  }

  private handleError(name: string) {
    return err => {
      console.log(err);
    };
  }
}

const filePersistence = new FilePersistence();

export default filePersistence;
