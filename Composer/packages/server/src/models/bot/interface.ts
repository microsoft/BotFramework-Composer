// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ILuisConfig, IQnAConfig } from '@bfc/shared';

import { CrossTrainConfig } from './builder';
import { RecognizerTypes } from './recognizer';

export interface LocationRef {
  storageId: string;
  path: string;
}

export interface IBuildConfig {
  luisConfig: ILuisConfig;
  qnaConfig: IQnAConfig;
  luFileIds: string[];
  qnaFileIds: string[];
  crossTrainConfig: CrossTrainConfig;
  recognizerTypes: RecognizerTypes;
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
