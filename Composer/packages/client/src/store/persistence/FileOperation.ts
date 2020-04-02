// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { FileErrorHandler } from './types';
import * as client from './http';

export class FileOperation {
  public file: FileInfo | undefined;
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

  async updateFile(content: string, errorHandler: FileErrorHandler) {
    this.errorHandler = errorHandler;
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
