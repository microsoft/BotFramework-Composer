// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs-extra';

import { PublishStep, OnDeploymentProgress, PublishingWorkingSet } from './types';

type StepConfig = {
  zipPath: string;
};

export const createCleanBuildStep = (config: StepConfig): PublishStep => {
  const execute = async (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress): Promise<void> => {
    const { zipPath } = config;

    onProgress(202, 'Cleaning build...');

    if (await fs.pathExists(zipPath)) {
      await fs.remove(zipPath);
    }
  };
  return { execute };
};
