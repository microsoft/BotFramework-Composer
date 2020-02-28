// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface LocationRef {
  storageId: string;
  path: string;
}

export interface ILuisSettings {
  luis: {
    [key: string]: string;
    endpoint: string;
    endpointKey: string;
  };
}

export interface LuisStatus {
  lastUpdateTime: number;
  lastPublishTime: number;
}

// we will probably also use this interface to consolidate the processing of lu\lg\dialog
export enum FileUpdateType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface ILuisConfig {
  name: string;
  authoringKey: string;
  endpointKey: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}

export interface IOperationLUFile {
  diagnostics?: any[]; // ludown parser output
  relativePath?: string;
  content?: string;
  intents: [];
  lastUpdateTime?: number;
  lastPublishTime?: number;
  [key: string]: any;
}

export interface ILuisStatusOperation {
  [key: string]: IOperationLUFile;
}

export interface DialogSetting {
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  luis: ILuisConfig;
  [key: string]: any;
}
