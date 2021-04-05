// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type OrchestratorModelRequest = {
  kind: 'en_intent' | 'multilingual_intent';
  name: string;
};

export enum DownloadState {
  STOPPED = 'STOPPED',
  ALREADYDOWNLOADED = 'ALREADYDOWNLOADED',
  DOWNLOADING = 'DOWNLOADING',
}
