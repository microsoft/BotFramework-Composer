// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum FileChangeType {
  DELETE = 1,
  UPDATE,
  CREATE,
}

export interface ResourceInfo {
  name: string;
  content: string;
  changeType: FileChangeType;
}
