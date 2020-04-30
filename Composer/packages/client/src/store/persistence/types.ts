// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChangeType {
  DELETE = 1,
  UPDATE,
  CREATE,
}

export enum FileExtensions {
  Dialog = '.dialog',
  Manifest = '.manifest',
  Lu = '.lu',
  Lg = '.lg',
}

export type FileErrorHandler = (error) => void;

export interface IFileChange {
  id: string; //now use file name
  change: string;
  type: ChangeType;
}
