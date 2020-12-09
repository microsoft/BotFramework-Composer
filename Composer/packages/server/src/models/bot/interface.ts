// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BaseSchema } from '@bfc/shared';

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
}

export interface ILuisStatusOperation {
  [key: string]: IOperationLUFile;
}

export interface IOrchestratorNLRList {
  version: string;
  defaults: Record<string, string>;
  readonly models: Record<
    string,
    {
      releaseDate: string;
      modelUri: string;
      description: string;
      minSDKVersion: string;
    }
  >;
}

export interface IOrchestratorProgress {
  (status: string): void;
}
export interface IOrchestratorBuildOutput {
  outputs: [{ id: string; snapshot: Uint8Array; recognizer: Record<string, BaseSchema> }];
  settings: {
    orchestrator: {
      modelPath: string;
      snapshots: Map<string, string>;
    };
  };
}
