// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs-extra';

import { OnPublishProgress } from './types';

type StepConfig = {
  zipPath: string;
};

export const cleanBuildStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  const { zipPath } = config;

  onProgress(202, 'Cleaning build...');

  if (await fs.pathExists(zipPath)) {
    await fs.remove(zipPath);
  }
};
