// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { FileChangeType, ResourceInfo, FileErrorHandler } from './types';
import * as client from './http';

export class FileOperation {
  private file: FileInfo | undefined;
  private projectId: string;
  private errorHandler: FileErrorHandler = error => {};

  private debouncedUpdate = debounce(async (content: string) => {
    if (this.file) {
      try {
        const response = await client.updateFile(this.projectId, this.file.name, content);
        this.file.content = content;
        this.file.lastModified = response.data.lastModified;
      } catch (error) {
        //the error can't be thrown out to upper layer
        this.errorHandler(error);
      }
    }
  }, 500);

  constructor(projectId: string, file?: FileInfo) {
    this.projectId = projectId;
    this.file = file;
  }

  async operation(fileInfo: ResourceInfo, errorHandler: FileErrorHandler) {
    const { changeType, content, name } = fileInfo;
    this.errorHandler = errorHandler;
    switch (changeType) {
      case FileChangeType.CREATE:
        await this.createFile(name, content);
        break;
      case FileChangeType.DELETE:
        await this.removeFile();
        break;
      case FileChangeType.UPDATE:
        await this.updateFile(content);
        break;
    }
  }

  async updateFile(content: string) {
    await this.debouncedUpdate(content);
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

  flush() {
    this.debouncedUpdate.flush();
  }
}
