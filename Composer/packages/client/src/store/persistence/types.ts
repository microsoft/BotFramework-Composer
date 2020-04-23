// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChangeType {
  DELETE = 1,
  UPDATE,
  CREATE,
}

export enum FileExtensions {
  Dialog = '.dialog',
  Lu = '.lu',
  Lg = '.lg',
}

export interface ResourceInfo {
  name: string;
  content: string;
}

export type FileErrorHandler = (error) => void;

export interface IFileChange {
  id: string;
  change: string;
  type: ChangeType;
}
