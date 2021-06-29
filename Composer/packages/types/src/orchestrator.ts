// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ModelTypes = 'en_intent' | 'multilingual_intent';

export type OrchestratorModelRequest = {
  kind: ModelTypes;
  name: string;
};

export enum DownloadState {
  STOPPED = 'STOPPED',
  ALREADYDOWNLOADED = 'ALREADYDOWNLOADED',
  DOWNLOADING = 'DOWNLOADING',
}

export interface IOrchestratorNLRList {
  version: string;
  defaults: Record<ModelTypes, string>;
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
