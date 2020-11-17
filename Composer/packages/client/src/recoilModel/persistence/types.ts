// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ChangeType {
  DELETE = 1,
  UPDATE,
  CREATE,
}

export enum FileExtensions {
  Dialog = '.dialog',
  FormDialogSchema = '.form',
  DialogSchema = '.dialog.schema',
  Manifest = '.json',
  Lu = '.lu',
  Lg = '.lg',
  QnA = '.qna',
  SourceQnA = '.source.qna',
  Setting = 'appsettings.json',
  BotProject = '.botproj',
  Recognizer = '',
  CrossTrainConfig = 'cross-train.config.json',
}

export type FileErrorHandler = (error) => void;

export interface IFileChange {
  projectId: string;
  id: string; //now use file name
  change: string;
  type: ChangeType;
}
