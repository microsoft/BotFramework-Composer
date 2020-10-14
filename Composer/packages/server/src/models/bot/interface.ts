// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema, ILuisConfig, IQnAConfig } from '@bfc/shared';

import { ICrossTrainConfig } from './builder';

export interface LocationRef {
  storageId: string;
  path: string;
}

export interface IBuildConfig {
  luisConfig: ILuisConfig;
  qnaConfig: IQnAConfig;
  luFileIds: string[];
  qnaFileIds: string[];
  crossTrainConfig: ICrossTrainConfig;
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

export interface IOrchestratorNLRList {
  version: string;
  readonly models: {
    [versionId: string]: {
      releaseDate: string;
      description: string;
    };
  };
}

export interface IOrchestratorProgress {
  (status: string): void;
}

export interface IOrchestratorRecognizer extends BaseSchema {
  modelPath: string;
  snapshotPath: string;
  entityRecognizers: any[];
}

export interface IOrchestratorBuildOutput {
  outputs: [{ id: string; snapshot: Uint8Array; recognizer: { [recog: string]: BaseSchema } }];
  settings: {
    orchestrator: {
      modelPath: string;
      snapshots: Map<string, string>;
    };
  };
}
