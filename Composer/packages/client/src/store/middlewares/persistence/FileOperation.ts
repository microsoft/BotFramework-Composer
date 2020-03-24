// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/indexers';
import debounce from 'lodash/debounce';

import { FileChangeType } from './../persistence/types';
import * as client from './http';

export class FileOperation {
  private file: FileInfo | undefined;
  private projectId: string;

  private debouncedUpdate = debounce(async (content: string) => {
    if (this.file) {
      await client.updateFile(this.projectId, this.file.name, content);
      this.file.content = content;
    }
  }, 500);

  constructor(projectId: string, file?: FileInfo) {
    this.projectId = projectId;
    this.file = file;
  }

  operation(payload: any) {
    const { changeType, content, name } = payload;
    let strContent = content;
    if (typeof content !== 'string') {
      strContent = JSON.stringify(content, null, 2) + '\n';
    }
    switch (changeType) {
      case FileChangeType.CREATE:
        this.createFile(name, strContent);
        break;
      case FileChangeType.DELETE:
        this.removeFile();
        break;
      case FileChangeType.UPDATE:
        this.updateFile(strContent);
        break;
    }
  }

  updateFile(content: string) {
    this.debouncedUpdate(content);
  }

  async removeFile() {
    if (this.file) {
      this.debouncedUpdate.cancel();
      await client.deleteFile(this.projectId, this.file.name);
    }
  }

  async createFile(name: string, content: string) {
    this.file = await client.createFile(this.projectId, name, content);
  }
}
