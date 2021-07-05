// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBotProject } from '@botframework-composer/types';

import { PublishStep, OnDeploymentProgress, PublishingWorkingSet } from './types';

type StepConfig = {
  profileName: string;
  project: IBotProject;
  projectPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtime: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
};

export const buildRuntimeStep = (config: StepConfig): PublishStep => {
  const execute = async (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress): Promise<void> => {
    const { profileName, project, projectPath, runtime, settings } = config;

    onProgress(202, 'Building runtime...');

    const luisAppIds = workingSet.luisAppIds;
    const qnaConfig = await project.builder.getQnaConfig();

    //TODO: Consider if the entire settings should go in the working set.
    const updatedSettings = {
      ...settings,
      luis: {
        ...settings.luis,
        ...luisAppIds,
      },
      qna: {
        ...settings.qna,
        ...qnaConfig,
      },
    };

    const pathToArtifacts = await runtime.buildDeploy(projectPath, project, updatedSettings, profileName);

    workingSet.pathToArtifacts = pathToArtifacts;

    onProgress(202, 'Runtime built!');
  };
  return { execute };
};
