// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChangeType {
  DELETE = 1,
  UPDATE,
  CREATE,
}

export enum FileExtensions {
  Dialog = '.dialog',
  DialogSchema = '.dialog.schema',
  Manifest = '.json',
  Lu = '.lu',
  Lg = '.lg',
  Setting = 'appsettings.json',
  FormDialogSchema = '.form-dialog',
}

export type FileErrorHandler = (error) => void;

export interface IFileChange {
  projectId: string;
  id: string; //now use file name
  change: string;
  type: ChangeType;
}
