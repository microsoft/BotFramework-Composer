// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { FileChangeType, ResourceInfo } from './../persistence/types';
import * as client from './http';

export class FileOperation {
  private file: FileInfo | undefined;
  private projectId: string;

  private debouncedUpdate = debounce(async (content: string) => {
    if (this.file) {
      const response = await client.updateFile(this.projectId, this.file.name, content);
      this.file.content = content;
      this.file.lastModified = response.data.lastModified;
    }
  }, 500);

  constructor(projectId: string, file?: FileInfo) {
    this.projectId = projectId;
    this.file = file;
  }

  operation(fileInfo: ResourceInfo) {
    const { changeType, content, name } = fileInfo;

    switch (changeType) {
      case FileChangeType.CREATE:
        this.createFile(name, content);
        break;
      case FileChangeType.DELETE:
        this.removeFile();
        break;
      case FileChangeType.UPDATE:
        this.updateFile(content);
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
