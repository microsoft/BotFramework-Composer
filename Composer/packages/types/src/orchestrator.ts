// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ModelType = 'en_intent' | 'multilingual_intent';

export type OrchestratorModelRequest = {
  kind: ModelType;
  name: string;
};

export enum DownloadState {
  STOPPED = 'STOPPED',
  ALREADYDOWNLOADED = 'ALREADYDOWNLOADED',
  DOWNLOADING = 'DOWNLOADING',
}

export type IOrchestratorNLRList = {
  version: string;
  defaults: Record<ModelType, string>;
  readonly models: Record<
    string,
    {
      releaseDate: string;
      modelUri: string;
      description: string;
      minSDKVersion: string;
    }
  >;
};
