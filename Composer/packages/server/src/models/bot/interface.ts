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

// we will probably also use this interface to consolidate the processing of lu\lg\dialog
export enum FileUpdateType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface ILuisConfig {
  name: string;
  endpoint: string;
  authoringKey: string;
  endpointKey: string;
  authoringEndpoint: string;
  authoringRegion: string | 'westus';
  defaultLanguage: string | 'en-us';
  environment: string | 'composer';
}

export interface IOperationLUFile {
  diagnostics?: any[]; // ludown parser output
  relativePath?: string;
  content?: string;
  intents: [];
  [key: string]: any;
}

export interface ILuisStatusOperation {
  [key: string]: IOperationLUFile;
}

export interface DialogSetting {
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  luis: ILuisConfig;
  skill: { manifestUrl: string; name: string }[];
  [key: string]: any;
}
