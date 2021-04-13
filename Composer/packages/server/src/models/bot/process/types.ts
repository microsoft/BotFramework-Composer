// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';

export type BuildPayload = {
  type: 'build' | 'warmup';
  projectId: string;
  files: FileInfo[];
  modelPath: string;
  generatedFolderPath: string;
};

export type RequestMsg = {
  id: string;
  payload: BuildPayload;
};

export type ResponseMsg = {
  id: string;
  error?: any;
  payload?: any;
};
